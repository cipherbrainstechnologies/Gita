import {z} from "zod";
import {getProductBySlug} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {slugRe} from "@/lib/checkout";
import * as repo from "./cart.repository";

export const MAX_QTY = 5;
export const MAX_DISTINCT = 20;
export const addSchema = z.object({
  productSlug: z.string().regex(slugRe), size: z.string().trim().toUpperCase().min(1).max(8), quantity: z.number().int().min(1).max(MAX_QTY).default(1)
});
export const patchSchema = z.object({id: z.string().min(1).max(40), quantity: z.number().int().min(1).max(MAX_QTY)});

export type CartLine = {
  id: string; productSlug: string; name: string; size: string; quantity: number;
  /** null when the item is no longer purchasable. */
  unitPaise: string | null; linePaise: string | null; available: boolean; reason?: string;
};
export type CartView = {lines: CartLine[]; subtotalPaise: string; availableCount: number};
export type CartResult<T> = {ok: true; data: T} | {ok: false; status: number; code: string; message: string};
const fail = (status: number, code: string, message: string): CartResult<never> => ({ok: false, status, code, message});

export async function getCart(email: string): Promise<CartView> {
  const customerId = await repo.findCustomerId(email);
  const items = customerId ? await repo.listItems(customerId) : [];
  if (!items.length) return {lines: [], subtotalPaise: "0", availableCount: 0};
  let subtotal = 0n, availableCount = 0;
  const lines = await Promise.all(items.map(async (i): Promise<CartLine> => {
    const p = await getProductBySlug(i.productSlug);
    const v = p?.variants.find(x => x.size === i.size && x.enabled);
    const ok = Boolean(p?.orderable && v && checkoutEnabled());
    if (ok && v) { subtotal += BigInt(v.pricePaise) * BigInt(i.quantity); availableCount++; }
    return {
      id: i.id, productSlug: i.productSlug, name: p?.name ?? i.productSlug, size: i.size, quantity: i.quantity,
      unitPaise: ok && v ? v.pricePaise : null, linePaise: ok && v ? (BigInt(v.pricePaise) * BigInt(i.quantity)).toString() : null,
      available: ok, reason: ok ? undefined : "No longer open for preorder in this size."
    };
  }));
  return {lines, subtotalPaise: subtotal.toString(), availableCount};
}

/** Only PREORDER products with an enabled variant in that size can be carted, and only while checkout is on. */
export async function addToCart(email: string, raw: unknown): Promise<CartResult<{id: string; quantity: number}>> {
  const p = addSchema.safeParse(raw);
  if (!p.success) return fail(422, "INVALID_CART_ITEM", "Check product, size and quantity.");
  const {productSlug, size, quantity} = p.data;
  const product = await getProductBySlug(productSlug);
  if (!product) return fail(404, "PRODUCT_NOT_FOUND", "Unknown product.");
  if (!checkoutEnabled() || !product.orderable) return fail(409, "NOT_ORDERABLE", "Only items open for preorder can be added to the cart. Join the waitlist instead.");
  if (!product.variants.some(v => v.enabled && v.size === size)) return fail(409, "VARIANT_UNAVAILABLE", "This size is not open for preorder.");
  const customerId = await repo.ensureCustomerId(email);
  const existing = await repo.findItem(customerId, productSlug, size);
  if (!existing && (await repo.countItems(customerId)) >= MAX_DISTINCT) return fail(409, "CART_FULL", `A cart can hold up to ${MAX_DISTINCT} different items.`);
  const row = await repo.upsertItem(customerId, productSlug, size, Math.min(MAX_QTY, (existing?.quantity ?? 0) + quantity));
  return {ok: true, data: row};
}

export async function removeFromCart(email: string, id: string): Promise<CartResult<{removed: number}>> {
  if (!id || id.length > 40) return fail(422, "INVALID_ID", "Missing cart item id.");
  const customerId = await repo.findCustomerId(email);
  if (!customerId) return {ok: true, data: {removed: 0}};
  return {ok: true, data: {removed: (await repo.deleteItem(customerId, id)).count}};
}

export async function setCartQuantity(email: string, raw: unknown): Promise<CartResult<{updated: number}>> {
  const p = patchSchema.safeParse(raw);
  if (!p.success) return fail(422, "INVALID_CART_ITEM", `Quantity must be 1-${MAX_QTY}.`);
  const customerId = await repo.findCustomerId(email);
  if (!customerId) return fail(404, "CART_ITEM_NOT_FOUND", "Item not found.");
  const r = await repo.updateQuantity(customerId, p.data.id, p.data.quantity);
  return r.count ? {ok: true, data: {updated: r.count}} : fail(404, "CART_ITEM_NOT_FOUND", "Item not found.");
}
