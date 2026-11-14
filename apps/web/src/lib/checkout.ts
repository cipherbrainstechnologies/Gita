import {randomBytes} from "node:crypto";
import {Prisma} from "@prisma/client";
import {z} from "zod";
import {prisma} from "./db";
import {calculateDepositBreakdown} from "./deposit";
import {calculateCart} from "./money";
import {decryptSecret, encryptSecret} from "./vault";

export const slugRe = /^[a-z0-9-]{1,120}$/;
const base = z.object({productSlug: z.string().regex(slugRe), size: z.string().trim().toUpperCase().min(1).max(8)});
export const waitlistSchema = base.extend({email: z.string().trim().toLowerCase().email().max(254)});
export const orderSchema = base.extend({
  quantity: z.number().int().min(1).max(5).default(1),
  acceptPolicies: z.literal(true),
  shipping: z.object({
    name: z.string().trim().min(2).max(100), phone: z.string().trim().regex(/^\+?\d{10,13}$/),
    line1: z.string().trim().min(3).max(200), line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), pincode: z.string().regex(/^\d{6}$/)
  })
});
export type OrderInput = z.infer<typeof orderSchema>;
type Result = {status: number; body: Record<string, unknown>};
const fail = (status: number, code: string, message: string): Result => ({status, body: {error: {code, message}}});
class Abort extends Error { constructor(public r: Result) { super(r.status + "") } }

async function razorpayCreds() {
  try {
    const row = await prisma.integrationSetting.findUnique({where: {provider: "RAZORPAY"}});
    if (!row) return null;
    const parsed = z.object({keyId: z.string().min(4), keySecret: z.string().min(4)}).safeParse(JSON.parse(decryptSecret({payload: row.encryptedPayload, nonce: row.nonce, authTag: row.authTag}, "RAZORPAY")));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}
const seller = () => {
  const {LEGAL_SELLER_NAME: name, LEGAL_SELLER_GSTIN: gstin, LEGAL_SELLER_ADDRESS: address} = process.env;
  return name && gstin && address ? {name, gstin, address} : null;
};

/**
 * Creates a DRAFT order, reserves confirmed preorder capacity atomically, then opens a Razorpay order.
 * Never marks anything paid: PAID is reserved for a verified webhook (not yet implemented → orders stay PAYMENT_PENDING).
 */
export async function createDraftOrder(a: {email: string; input: OrderInput; idemKey: string}): Promise<Result> {
  const {input} = a;
  const creds = await razorpayCreds();
  if (!creds) return fail(503, "PROVIDER_NOT_CONFIGURED", "Razorpay credentials are not configured in the encrypted integration vault.");
  const sellerSnap = seller();
  if (!sellerSnap) return fail(503, "LEGAL_ENTITY_NOT_CONFIGURED", "Legal seller details are not configured.");
  const policies = await prisma.policyVersion.findMany({where: {status: "APPROVED"}, select: {policyType: true, version: true, contentSha: true}});
  if (!policies.length) return fail(503, "POLICY_NOT_APPROVED", "No approved policy versions exist; checkout stays closed.");

  const customer = await prisma.customer.upsert({where: {email: a.email}, create: {email: a.email}, update: {}});
  const idemKey = `${customer.id}:${a.idemKey}`;
  try { await prisma.externalIdempotency.create({data: {operation: "checkout", externalKey: idemKey}}); }
  catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    const prior = await prisma.externalIdempotency.findUnique({where: {operation_externalKey: {operation: "checkout", externalKey: idemKey}}});
    return prior?.result ? {status: 200, body: prior.result as Record<string, unknown>} : fail(409, "REQUEST_IN_PROGRESS", "A request with this Idempotency-Key is already being processed.");
  }

  let order: {id: string; publicId: string; totalPaise: bigint; chargeDuePaise: bigint; capacityId: string};
  try {
    order = await prisma.$transaction(async tx => {
      const variant = await tx.productVariant.findFirst({where: {size: input.size, enabled: true, product: {slug: input.productSlug, status: "PREORDER"}}, include: {product: true}});
      if (!variant) throw new Abort(fail(409, "VARIANT_UNAVAILABLE", "This size is not open for preorder."));
      if (variant.taxRateBasisPoints == null || variant.currency !== "INR") throw new Abort(fail(409, "PRICING_INCOMPLETE", "Tax configuration for this item is incomplete."));
      const cap = await tx.preorderCapacity.findFirst({where: {variantId: variant.id, confirmed: true, shipWindowTo: {gt: new Date()}}, orderBy: {shipWindowFrom: "asc"}});
      if (!cap) throw new Abort(fail(409, "NO_CONFIRMED_CAPACITY", "No supplier-confirmed capacity for this item."));
      // Atomic conditional reserve: cannot oversell under concurrency.
      const n = await tx.$executeRaw`UPDATE "PreorderCapacity" SET reserved = reserved + ${input.quantity}, "updatedAt" = now() WHERE id = ${cap.id} AND confirmed AND capacity - reserved >= ${input.quantity}`;
      if (n !== 1) throw new Abort(fail(409, "SOLD_OUT", "Requested quantity exceeds remaining confirmed capacity."));
      // Prices are tax-inclusive: tax is extracted for display/records and NOT added to the total.
      const gross = variant.pricePaise * BigInt(input.quantity);
      const tax = (gross * BigInt(variant.taxRateBasisPoints)) / BigInt(10000 + variant.taxRateBasisPoints);
      const shipping = BigInt(process.env.SHIPPING_FLAT_PAISE ?? "0");
      const t = calculateCart([{unitPaise: variant.pricePaise, quantity: input.quantity, discountPaise: 0n, taxPaise: 0n}], shipping);
      const policy = await tx.depositPolicy.findUnique({where: {id: "default"}});
      const depositCheckout = process.env.ENABLE_DEPOSIT_CHECKOUT === "true";
      const staged = calculateDepositBreakdown(t.totalPaise, policy, {depositCheckoutEnabled: depositCheckout});
      const created = await tx.order.create({data: {
        publicId: `VM-${randomBytes(5).toString("hex").toUpperCase()}`, customerId: customer.id, status: "DRAFT",
        subtotalPaise: t.subtotalPaise, shippingPaise: t.shippingPaise, taxPaise: tax, totalPaise: staged.fullTotalPaise,
        chargeDuePaise: staged.chargeNowPaise, depositDuePaise: staged.depositDuePaise, balanceDuePaise: staged.balanceDuePaise,
        addressEncrypted: JSON.stringify(encryptSecret(JSON.stringify(input.shipping), "ORDER_ADDRESS")),
        legalSellerSnapshot: sellerSnap, shippingPromise: {from: cap.shipWindowFrom.toISOString(), to: cap.shipWindowTo.toISOString()},
        acceptedPolicy: {policies, acceptedAt: new Date().toISOString(), deposit: staged.usingDeposit ? {depositPaise: staged.depositDuePaise.toString(), balancePaise: staged.balanceDuePaise.toString()} : null}
      }, select: {id: true, publicId: true, totalPaise: true, chargeDuePaise: true}});
      await tx.orderLine.create({data: {orderId: created.id, productId: variant.productId, variantId: variant.id, skuSnapshot: variant.sku, description: variant.product.title, quantity: input.quantity, unitPaise: variant.pricePaise, taxPaise: tax, discountPaise: 0n, attributes: {size: variant.size, colour: variant.colour, fit: variant.fit}}});
      return {...created, capacityId: cap.id};
    });
  } catch (e) {
    await prisma.externalIdempotency.delete({where: {operation_externalKey: {operation: "checkout", externalKey: idemKey}}}).catch(() => {});
    if (e instanceof Abort) return e.r;
    return fail(503, "CHECKOUT_UNAVAILABLE", "Could not create the order. Nothing was charged.");
  }

  const release = (status: "CANCELLED") => prisma.$transaction([
    prisma.$executeRaw`UPDATE "PreorderCapacity" SET reserved = reserved - ${input.quantity}, "updatedAt" = now() WHERE id = ${order.capacityId} AND reserved >= ${input.quantity}`,
    prisma.order.update({where: {id: order.id}, data: {status}}),
    prisma.externalIdempotency.delete({where: {operation_externalKey: {operation: "checkout", externalKey: idemKey}}})
  ]);
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST", signal: AbortSignal.timeout(10_000),
      headers: {"Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64")},
      body: JSON.stringify({amount: Number(order.chargeDuePaise > 0n ? order.chargeDuePaise : order.totalPaise), currency: "INR", receipt: order.publicId, notes: {orderPublicId: order.publicId}})
    });
    const rp = (await res.json()) as {id?: string};
    if (!res.ok || !rp.id) throw new Error("provider " + res.status);
    const charge = order.chargeDuePaise > 0n ? order.chargeDuePaise : order.totalPaise;
    const usingDeposit = charge < order.totalPaise;
    const body = {
      orderId: order.publicId, status: "PAYMENT_PENDING", razorpayOrderId: rp.id, keyId: creds.keyId,
      amountPaise: charge.toString(), fullTotalPaise: order.totalPaise.toString(), balanceDuePaise: (order.totalPaise - charge).toString(),
      paymentStage: usingDeposit ? "DEPOSIT" : "FULL", currency: "INR",
      notice: usingDeposit
        ? "Order created for a ₹ deposit only. Balance is due before manufacturing. Payment is recorded only after a verified Razorpay webhook."
        : "Order created but NOT paid. Payment is recorded only after a verified Razorpay webhook.",
    };
    await prisma.$transaction([
      prisma.payment.create({data: {orderId: order.id, provider: "RAZORPAY", providerOrderId: rp.id, status: "CREATED", amountPaise: charge, intentType: usingDeposit ? "DEPOSIT" : "FULL"}}),
      prisma.order.update({where: {id: order.id}, data: {status: "PAYMENT_PENDING"}}),
      prisma.auditLog.create({data: {actor: `customer:${customer.id}`, action: "ORDER_DRAFT_CREATED", target: order.publicId, details: {razorpayOrderId: rp.id}}}),
      prisma.externalIdempotency.update({where: {operation_externalKey: {operation: "checkout", externalKey: idemKey}}, data: {result: body}})
    ]);
    return {status: 201, body};
  } catch {
    await release("CANCELLED").catch(() => {});
    return fail(502, "PROVIDER_ERROR", "Payment provider unavailable. Nothing was charged; please retry.");
  }
}
