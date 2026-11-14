/** Pure dashboard helpers (no I/O). */
export const PRODUCT_STATUS_ORDER = ["CONCEPT", "SAMPLE_PENDING", "SAMPLE_APPROVED", "PREORDER", "CLOSED", "ARCHIVED"] as const;
const IST_OFFSET_MS = 330 * 60_000;

/** 00:00 India Standard Time of the day containing `now`, as an absolute instant. */
export function istDayStart(now: Date): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}
