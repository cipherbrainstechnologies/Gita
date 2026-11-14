/** Pure catalog rules (no I/O, safe to import from client components). */
export type ProductStatus = "CONCEPT" | "SAMPLE_PENDING" | "SAMPLE_APPROVED" | "PREORDER" | "CLOSED" | "ARCHIVED";

/**
 * Allowed status moves. Forward chain CONCEPT -> SAMPLE_PENDING -> SAMPLE_APPROVED -> PREORDER; limited rollback before
 * PREORDER; a live PREORDER can only be CLOSED (never silently archived while customers may hold orders).
 */
export const PRODUCT_TRANSITIONS: Record<ProductStatus, readonly ProductStatus[]> = {
  CONCEPT: ["SAMPLE_PENDING", "ARCHIVED"],
  SAMPLE_PENDING: ["SAMPLE_APPROVED", "CONCEPT", "ARCHIVED"],
  SAMPLE_APPROVED: ["PREORDER", "SAMPLE_PENDING", "ARCHIVED"],
  PREORDER: ["CLOSED"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: []
};
export const canTransition = (from: ProductStatus, to: ProductStatus): boolean => PRODUCT_TRANSITIONS[from].includes(to);

/** Variants may only be switched on once a physical sample is approved; they can always be switched off. */
export const VARIANT_ENABLE_STATUSES: readonly ProductStatus[] = ["SAMPLE_APPROVED", "PREORDER"];

export type PreorderFacts = {
  hsnCode: string | null;
  variants: {id: string; taxRateBasisPoints: number | null}[];
  capacities: {variantId: string; confirmed: boolean; capacity: number; shipWindowTo: Date}[];
};
export type PreorderBlocker = "HSN_MISSING" | "NO_VARIANT_TAX_RATE" | "NO_CONFIRMED_CAPACITY";
export type PreorderGate = {ok: boolean; blockers: PreorderBlocker[]; demoBypassUsed: boolean};

/**
 * PREORDER gate: HSN present, at least one variant with a tax rate, and supplier-confirmed capacity (future ship window, capacity > 0)
 * on such a variant. `demo` waives ONLY the capacity requirement; checkout still refuses orders without real capacity, so no stock is invented.
 */
export function evaluatePreorderGate(facts: PreorderFacts, opts: {demo: boolean; now: Date}): PreorderGate {
  const blockers: PreorderBlocker[] = [];
  if (!facts.hsnCode || !/^\d{4}(\d{2}){0,2}$/.test(facts.hsnCode)) blockers.push("HSN_MISSING");
  const taxed = new Set(facts.variants.filter(v => v.taxRateBasisPoints != null).map(v => v.id));
  if (taxed.size === 0) blockers.push("NO_VARIANT_TAX_RATE");
  const hasCapacity = facts.capacities.some(c => taxed.has(c.variantId) && c.confirmed && c.capacity > 0 && c.shipWindowTo > opts.now);
  let demoBypassUsed = false;
  if (!hasCapacity) {
    if (opts.demo) demoBypassUsed = true;
    else blockers.push("NO_CONFIRMED_CAPACITY");
  }
  return {ok: blockers.length === 0, blockers, demoBypassUsed};
}

export const BLOCKER_MESSAGES: Record<PreorderBlocker, string> = {
  HSN_MISSING: "Set a valid HSN code (4, 6 or 8 digits) on the product.",
  NO_VARIANT_TAX_RATE: "At least one variant needs a tax rate (basis points).",
  NO_CONFIRMED_CAPACITY: "A supplier-confirmed PreorderCapacity with a future ship window is required on a taxed variant."
};
