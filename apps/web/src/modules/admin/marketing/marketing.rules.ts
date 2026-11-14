/** Pure promotion helpers (no I/O, safe for client components). */
export const PROMOTION_KINDS = ["SEASONAL", "CATEGORY", "LAUNCH", "PARTNER", "BIRTHDAY", "MANUAL"] as const;
/** Hard ceiling on a simple percentage promotion. Anything deeper needs a reviewed margin floor and a code change. */
export const MAX_PERCENT_OFF = 70;

export type PromotionPhase = "INACTIVE" | "SCHEDULED" | "LIVE" | "EXPIRED";

/** Effective phase from the stored flag and window. `active` is an on/off switch; the window is always enforced on top of it. */
export function promotionPhase(p: {active: boolean; startsAt: Date; endsAt: Date}, now: Date): PromotionPhase {
  if (p.endsAt <= now) return "EXPIRED";
  if (!p.active) return "INACTIVE";
  return p.startsAt > now ? "SCHEDULED" : "LIVE";
}

export const percentOffOf = (rule: unknown): number | null => {
  const r = rule as {type?: unknown; percentOff?: unknown} | null;
  return r && r.type === "PERCENT_OFF" && typeof r.percentOff === "number" ? r.percentOff : null;
};

export const buildDiscountRule = (percentOff: number) => ({type: "PERCENT_OFF" as const, percentOff});

/** Customers are 18+ at checkout, so every promotion is adult-only; birthday offers are additionally flagged. Stacking is explicit. */
export const buildEligibility = (kind: string, exclusive: boolean) => ({adultsOnly: true, birthdayOnly: kind === "BIRTHDAY", stacking: exclusive ? "EXCLUSIVE" : "SINGLE_CODE_PER_ORDER"});

