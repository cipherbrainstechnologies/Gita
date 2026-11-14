import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {getProductBySlug} from "@/lib/catalog";
import {createDraftOrder, orderSchema, waitlistSchema} from "@/lib/checkout";
import {checkoutEnabled} from "@/lib/config";
import {prisma} from "@/lib/db";
import {enqueueNotification} from "@/modules/notifications/notifications";

export const dynamic = "force-dynamic";
const err = (status: number, code: string, message: string) => NextResponse.json({error: {code, message}}, {status, headers: {"Cache-Control": "no-store"}});

/**
 * ENABLE_CHECKOUT!=true (default): records waitlist INTEREST only (202). No order, reservation or payment.
 * ENABLE_CHECKOUT=true + PREORDER product with enabled variant: authenticated draft-order path; never marks paid.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try { raw = await req.json(); } catch { return err(400, "INVALID_JSON", "Request body must be JSON."); }
  const slug = (raw as {productSlug?: unknown})?.productSlug;
  const product = typeof slug === "string" ? await getProductBySlug(slug) : null;
  if (!product) return err(404, "PRODUCT_NOT_FOUND", "Unknown product.");

  if (checkoutEnabled() && product.orderable) {
    const session = await auth();
    const email = session?.user?.email?.trim().toLowerCase();
    if (!email) return err(401, "AUTH_REQUIRED", "Sign in to place a preorder.");
    const idem = req.headers.get("idempotency-key");
    if (!idem || idem.length < 8 || idem.length > 100) return err(400, "IDEMPOTENCY_KEY_REQUIRED", "Send an Idempotency-Key header (8-100 chars).");
    const p = orderSchema.safeParse(raw);
    if (!p.success) return err(422, "INVALID_ORDER", "Check size, quantity, shipping address and policy acceptance.");
    const r = await createDraftOrder({email, input: p.data, idemKey: idem});
    // Fresh draft only (201); idempotent replays return 200 and never re-notify.
    if (r.status === 201 && typeof r.body.orderId === "string") await enqueueNotification({event: "ORDER_CREATED", email, idempotencyKey: `order-created:${r.body.orderId}`, orderPublicId: r.body.orderId, payload: {orderId: r.body.orderId, status: String(r.body.status ?? "")}});
    return NextResponse.json(r.body, {status: r.status, headers: {"Cache-Control": "no-store"}});
  }

  const p = waitlistSchema.safeParse(raw);
  if (!p.success) return err(422, "INVALID_WAITLIST", "A valid email, product and size are required.");
  const {email, productSlug, size} = p.data;
  if (!product.sizes.includes(size)) return err(422, "INVALID_SIZE", `Size must be one of ${product.sizes.join(", ")}.`);
  if (!process.env.DATABASE_URL) return err(503, "WAITLIST_UNAVAILABLE", "Waitlist storage is unavailable. Nothing was saved; please try again later.");
  try {
    await prisma.waitlistLead.upsert({where: {email_productSlug: {email, productSlug}}, create: {email, productSlug, size}, update: {size}});
  } catch { return err(503, "WAITLIST_UNAVAILABLE", "Waitlist storage is unavailable. Nothing was saved; please try again later."); }
  await enqueueNotification({event: "WAITLIST_JOINED", email, idempotencyKey: `waitlist:${email}:${productSlug}`, payload: {productSlug, size}});
  return NextResponse.json({status: "WAITLISTED", message: "You are on the waitlist. This is not an order and no payment was taken. We will email you only if this piece is approved for preorder."},
    {status: 202, headers: {"Cache-Control": "no-store"}});
}
