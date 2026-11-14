/**
 * Demo-mode flags and demo-only fixtures. Server auth remains the security control: these helpers only drive
 * UI banners/hints. Never gate authorisation on them from the client.
 */
const on = (v: string | undefined) => v === "true" || v === "1";

/** Server-side: demo credentials sign-in is wired (DEMO_AUTH). Never true in production unless explicitly set. */
export const demoAuthEnabled = (): boolean => on(process.env.DEMO_AUTH);
/** Public UI flag (inlined at build for client code): shows demo banners + credentials form. */
export const demoUiEnabled = (): boolean => on(process.env.NEXT_PUBLIC_DEMO_MODE);
/** Any demo surface active. */
export const demoActive = (): boolean => demoAuthEnabled() || demoUiEnabled();

export type DemoAccount = {label: string; email: string; password?: string};
/**
 * Hints for the login form. Emails are always safe to show in demo UI; passwords are included ONLY when DEMO_AUTH is set server-side.
 * Values are configurable so the auth wiring and the UI cannot drift:
 *   DEMO_CUSTOMER_EMAIL / DEMO_CUSTOMER_PASSWORD, DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD
 */
export function demoAccounts(): DemoAccount[] {
  if (!demoActive()) return [];
  const withPw = demoAuthEnabled();
  const out: DemoAccount[] = [];
  const customer = process.env.DEMO_CUSTOMER_EMAIL?.trim() || "customer@verse.mode";
  const customerPw = process.env.DEMO_CUSTOMER_PASSWORD || "VerseDemo!Cust26";
  out.push({label: "Demo customer", email: customer, password: withPw ? customerPw : undefined});
  const admin = process.env.DEMO_ADMIN_EMAIL?.trim() || "admin@verse.mode";
  const adminPw = process.env.DEMO_ADMIN_PASSWORD || "VerseDemo!Admin26";
  out.push({label: "Demo admin", email: admin, password: withPw ? adminPw : undefined});
  const staff = process.env.DEMO_STAFF_EMAIL?.trim() || "staff@verse.mode";
  const staffPw = process.env.DEMO_STAFF_PASSWORD || "VerseDemo!Staff26";
  out.push({label: "Demo staff", email: staff, password: withPw ? staffPw : undefined});
  return out;
}

/** Only same-origin relative paths are accepted as post-login redirects (blocks open redirects). */
export function safeRedirect(target: string | undefined, fallback = "/account"): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return fallback;
  return target;
}
