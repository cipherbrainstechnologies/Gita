"use client";
import {useState} from "react";
import {signIn} from "next-auth/react";

export type DemoHint = {label: string; email: string; password?: string};

/**
 * Credentials sign-in for demo environments. Posts to Auth.js `credentials` provider; authorisation is decided by the server
 * (auth.ts), never here. If the provider is not wired the server rejects and an error is shown.
 */
export function LoginForm({redirectTo = "/account", hints = []}: {redirectTo?: string; hints?: DemoHint[]}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await signIn("credentials", {email: email.trim(), password, redirect: false, redirectTo});
      if (!res || res.error) setError("Sign-in failed. Check the demo email and password.");
      else window.location.assign(redirectTo);
    } catch { setError("Sign-in is unavailable right now."); }
    finally { setBusy(false); }
  }

  return <form className="studio-form" onSubmit={submit} aria-busy={busy}>
    <label>EMAIL<input name="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>PASSWORD<input name="password" type="password" autoComplete="current-password" required maxLength={200} value={password} onChange={e => setPassword(e.target.value)} /></label>
    {hints.length > 0 && <div className="demo-hints"><span>DEMO ACCOUNTS</span>{hints.map(h =>
      <button type="button" key={h.email} className="hint-chip" onClick={() => { setEmail(h.email); if (h.password) setPassword(h.password); }}>{h.label}: {h.email}</button>)}</div>}
    <button className="button primary-cta" type="submit" disabled={busy}>{busy ? "SIGNING IN…" : "SIGN IN WITH DEMO ACCOUNT"}</button>
    {error && <p role="alert" className="notice" style={{borderLeftColor: "var(--rust)"}}>{error}</p>}
  </form>;
}
