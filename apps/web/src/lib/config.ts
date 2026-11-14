/** Runtime feature flags. Server-only; values never contain secrets. */
export const checkoutEnabled = (): boolean => process.env.ENABLE_CHECKOUT === "true";
export type Stage = "preview" | "waitlist" | "checkout";
/** preview = default/unset; waitlist = PREVIEW_MODE=false without payments; checkout = payments flag on. */
export function stage(): Stage {
  if (checkoutEnabled()) return "checkout";
  return process.env.PREVIEW_MODE === "false" ? "waitlist" : "preview";
}
/** Rejects after `ms` so a dead dependency cannot hang a page render or health probe. */
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  return Promise.race([p, new Promise<T>((_, rej) => { t = setTimeout(() => rej(new Error("timeout")), ms); })]).finally(() => clearTimeout(t));
}
