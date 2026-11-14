import {withTimeout} from "@/lib/config";
import {findCustomerByEmail, findOrdersByCustomer, findWaitlistByEmail} from "./orders.repository";
import {buildTimeline, type Timeline} from "./order-timeline";

export type OrderLineView = {description: string; sku: string; quantity: number; unitPaise: string; size?: string; colour?: string};
export type OrderView = {
  publicId: string; status: string; currency: string; createdAt: string; paidAt: string | null;
  subtotalPaise: string; discountPaise: string; shippingPaise: string; taxPaise: string; totalPaise: string;
  shippingWindow: {from: string; to: string} | null;
  lines: OrderLineView[];
  payment: {provider: string; status: string; capturedAt: string | null} | null;
  timeline: Timeline;
  /** True only for the clearly-labelled demo fixture; never set on database orders. */
  sample?: boolean;
};
export type Loaded<T> = {ok: true; data: T} | {ok: false; reason: "DB_UNAVAILABLE"};

const normalise = (email: string) => email.trim().toLowerCase();
const DB_TIMEOUT_MS = 5000;
const str = (v: unknown) => (typeof v === "string" ? v : undefined);

function windowOf(v: unknown): {from: string; to: string} | null {
  const o = v as {from?: unknown; to?: unknown} | null;
  return o && typeof o.from === "string" && typeof o.to === "string" ? {from: o.from, to: o.to} : null;
}

/** Loads the signed-in customer's orders. A customer row is created lazily at first checkout, so "no customer" == "no orders". */
export async function listOrdersForEmail(rawEmail: string): Promise<Loaded<OrderView[]>> {
  if (!process.env.DATABASE_URL) return {ok: false, reason: "DB_UNAVAILABLE"};
  try {
    const email = normalise(rawEmail);
    const customer = await withTimeout(findCustomerByEmail(email), DB_TIMEOUT_MS);
    if (!customer) return {ok: true, data: []};
    const {orders, lines, payments} = await withTimeout(findOrdersByCustomer(customer.id, 50), DB_TIMEOUT_MS);
    const data = orders.map((o): OrderView => {
      const pay = payments.find(p => p.orderId === o.id);
      const paidAt = o.paidAt?.toISOString() ?? null;
      return {
        publicId: o.publicId, status: o.status, currency: o.currency, createdAt: o.createdAt.toISOString(), paidAt,
        subtotalPaise: o.subtotalPaise.toString(), discountPaise: o.discountPaise.toString(), shippingPaise: o.shippingPaise.toString(),
        taxPaise: o.taxPaise.toString(), totalPaise: o.totalPaise.toString(), shippingWindow: windowOf(o.shippingPromise),
        lines: lines.filter(l => l.orderId === o.id).map(l => {
          const a = (l.attributes ?? {}) as Record<string, unknown>;
          return {description: l.description, sku: l.skuSnapshot, quantity: l.quantity, unitPaise: l.unitPaise.toString(), size: str(a.size), colour: str(a.colour)};
        }),
        payment: pay ? {provider: pay.provider, status: pay.status, capturedAt: pay.capturedAt?.toISOString() ?? null} : null,
        timeline: buildTimeline(o.status, paidAt)
      };
    });
    return {ok: true, data};
  } catch { return {ok: false, reason: "DB_UNAVAILABLE"}; }
}

export type WaitlistEntryView = {productSlug: string; size: string; source: string; createdAt: string};
export async function listWaitlistForEmail(rawEmail: string): Promise<Loaded<WaitlistEntryView[]>> {
  if (!process.env.DATABASE_URL) return {ok: false, reason: "DB_UNAVAILABLE"};
  try {
    const rows = await withTimeout(findWaitlistByEmail(normalise(rawEmail)), DB_TIMEOUT_MS);
    return {ok: true, data: rows.map(r => ({productSlug: r.productSlug, size: r.size, source: r.source, createdAt: r.createdAt.toISOString()}))};
  } catch { return {ok: false, reason: "DB_UNAVAILABLE"}; }
}

/** Display-name lookup for the account page; falls back to the session name. */
export async function getCustomerProfile(rawEmail: string): Promise<{displayName: string | null; memberSince: string | null}> {
  if (!process.env.DATABASE_URL) return {displayName: null, memberSince: null};
  try {
    const c = await withTimeout(findCustomerByEmail(normalise(rawEmail)), DB_TIMEOUT_MS);
    return {displayName: c?.displayName ?? null, memberSince: c?.createdAt.toISOString() ?? null};
  } catch { return {displayName: null, memberSince: null}; }
}

/** Demo-only fixture so the timeline UI can be reviewed before any real preorder exists. Labelled SAMPLE in the UI. */
export function sampleOrder(): OrderView {
  const now = Date.now(), day = 86_400_000;
  const created = new Date(now - 6 * day).toISOString();
  return {
    publicId: "VM-SAMPLE0001", status: "IN_PRODUCTION", currency: "INR", createdAt: created, paidAt: new Date(now - 6 * day).toISOString(),
    subtotalPaise: "99900", discountPaise: "0", shippingPaise: "0", taxPaise: "4757", totalPaise: "99900",
    shippingWindow: {from: new Date(now + 14 * day).toISOString(), to: new Date(now + 28 * day).toISOString()},
    lines: [{description: "Quiet Power Oversized Tee", sku: "DEMO-QP-M", quantity: 1, unitPaise: "99900", size: "M", colour: "charcoal"}],
    payment: {provider: "DEMO", status: "CAPTURED", capturedAt: created},
    timeline: buildTimeline("IN_PRODUCTION", created), sample: true
  };
}
