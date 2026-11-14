import {demoAccounts, demoActive, demoAuthEnabled} from "@/lib/demo";

/** Shown on customer surfaces when DEMO_AUTH or NEXT_PUBLIC_DEMO_MODE is set. Passwords appear only when DEMO_AUTH is on server-side. */
export function DemoBanner({showCredentials = false}: {showCredentials?: boolean}) {
  if (!demoActive()) return null;
  const accounts = showCredentials && demoAuthEnabled() ? demoAccounts() : [];
  return <div className="demo-banner" role="note">
    <b>DEMO MODE</b>
    <p>This is a demonstration environment. Orders, payments and notifications here are not real, and nothing is shipped.</p>
    {accounts.length > 0 && <ul>{accounts.map(a => <li key={a.email}>{a.label}: <code>{a.email}</code>{a.password ? <> / <code>{a.password}</code></> : null}</li>)}</ul>}
  </div>;
}
