"use client";
import Link from "next/link";
import {useRef, useState} from "react";

type P = {slug: string; name: string; sizes: string[]};
const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

type Props = {
  products: P[]; initialSlug: string; initialSize?: string; initialQuantity?: number;
  mode: "waitlist" | "order";
  /** Order mode requires a server session; the API enforces this regardless of what the client believes. */
  signedIn?: boolean; email?: string; demo?: boolean;
};

export function CheckoutForm({products, initialSlug, initialSize, initialQuantity = 1, mode, signedIn = false, email, demo = false}: Props) {
  const [slug, setSlug] = useState(initialSlug);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ok: boolean; text: string; orderId?: string} | null>(null);
  // One Idempotency-Key per distinct request body: network retries of the same body reuse it, a changed body or a success rotates it.
  const key = useRef<{sig: string; id: string} | null>(null);
  const sizes = products.find(p => p.slug === slug)?.sizes ?? [];
  const order = mode === "order";

  if (order && !signedIn) {
    return <div className="studio-form">
      <p className="notice">Sign in to place a preorder. Your orders and payment status are tied to your account.</p>
      <Link className="primary-cta button" href={`/login?callbackUrl=${encodeURIComponent(`/checkout?product=${slug}`)}`}>SIGN IN TO PREORDER</Link>
    </div>;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = order
      ? {productSlug: slug, size: val(f, "size"), quantity: Number(val(f, "quantity")) || 1, acceptPolicies: f.get("accept") === "on",
         shipping: {name: val(f, "name"), phone: val(f, "phone"), line1: val(f, "line1"), line2: val(f, "line2") || undefined, city: val(f, "city"), state: val(f, "state"), pincode: val(f, "pincode")}}
      : {productSlug: slug, size: val(f, "size"), email: val(f, "email")};
    const sig = JSON.stringify(body);
    if (order && key.current?.sig !== sig) key.current = {sig, id: crypto.randomUUID()};
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/checkout", {method: "POST", headers: {"Content-Type": "application/json", ...(order && key.current ? {"Idempotency-Key": key.current.id} : {})}, body: sig});
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        if (order) key.current = null;
        setMsg({ok: true, orderId: order ? j.orderId : undefined, text: order ? `${j.notice ?? "Order created."} Order reference: ${j.orderId}.` : j.message});
      } else if (res.status === 401) setMsg({ok: false, text: "Your session has expired. Sign in again to place the preorder. Nothing was charged."});
      else setMsg({ok: false, text: j.error?.message ?? "Something went wrong. Nothing was charged."});
    } catch { setMsg({ok: false, text: "Network error. Nothing was submitted."}); }
    finally { setBusy(false); }
  }

  return <form className="studio-form" onSubmit={submit} aria-busy={busy}>
    {demo && <p className="notice demo-note"><b>DEMO MODE.</b> {order ? "No real payment is taken and nothing will be shipped." : "Waitlist entries here are demo data; no real emails are sent."}</p>}
    {order && email && <p className="notice">Ordering as <b>{email}</b>.</p>}
    <label>PRODUCT<select name="product" value={slug} onChange={e => setSlug(e.target.value)}>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
    <label>SIZE<select name="size" key={slug} defaultValue={sizes.includes(initialSize ?? "") ? initialSize : sizes[0]} required>{sizes.map(s => <option key={s}>{s}</option>)}</select></label>
    {order ? <>
      <label>QUANTITY<select name="quantity" defaultValue={String(Math.min(5, Math.max(1, initialQuantity)))}>{[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></label>
      <fieldset className="field-group"><legend>SHIPPING ADDRESS (INDIA)</legend>
        <label>FULL NAME<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
        <label>PHONE<input name="phone" type="tel" autoComplete="tel" required pattern="\+?\d{10,13}" title="10 to 13 digits, optional leading +" /></label>
        <label>ADDRESS LINE 1<input name="line1" autoComplete="address-line1" required minLength={3} maxLength={200} /></label>
        <label>ADDRESS LINE 2 (OPTIONAL)<input name="line2" autoComplete="address-line2" maxLength={200} /></label>
        <label>CITY<input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} /></label>
        <label>STATE<input name="state" autoComplete="address-level1" required minLength={2} maxLength={80} /></label>
        <label>PINCODE<input name="pincode" autoComplete="postal-code" required pattern="\d{6}" inputMode="numeric" title="6-digit pincode" /></label>
      </fieldset>
      <label><span><input name="accept" type="checkbox" required /> I accept the <a href="/policies" className="text-link" target="_blank" rel="noreferrer">policies</a> (preorder, cancellation, refund, shipping, privacy).</span></label>
    </> : <label>EMAIL<input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={email} /></label>}
    <button className="button primary-cta" type="submit" disabled={busy}>{busy ? "SENDING…" : order ? "CREATE PREORDER" : "JOIN THE WAITLIST"}</button>
    {msg && <p role="status" className="notice" style={msg.ok ? undefined : {borderLeftColor: "var(--rust)"}}>{msg.text}{msg.ok && msg.orderId && <> <Link className="text-link" href="/orders">VIEW ORDER</Link></>}</p>}
  </form>;
}
