"use client";
import {useRef, useState} from "react";

type P = {slug: string; name: string; sizes: string[]};
const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export function CheckoutForm({products, initialSlug, initialSize, mode}: {products: P[]; initialSlug: string; initialSize?: string; mode: "waitlist" | "order"}) {
  const [slug, setSlug] = useState(initialSlug);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ok: boolean; text: string} | null>(null);
  const idem = useRef(crypto.randomUUID());
  const sizes = products.find(p => p.slug === slug)?.sizes ?? [];
  const order = mode === "order";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = order
      ? {productSlug: slug, size: val(f, "size"), quantity: 1, acceptPolicies: f.get("accept") === "on",
         shipping: {name: val(f, "name"), phone: val(f, "phone"), line1: val(f, "line1"), line2: val(f, "line2") || undefined, city: val(f, "city"), state: val(f, "state"), pincode: val(f, "pincode")}}
      : {productSlug: slug, size: val(f, "size"), email: val(f, "email")};
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/checkout", {method: "POST", headers: {"Content-Type": "application/json", ...(order ? {"Idempotency-Key": idem.current} : {})}, body: JSON.stringify(body)});
      const j = await res.json();
      if (res.ok) setMsg({ok: true, text: order ? `${j.notice} Order reference: ${j.orderId}.` : j.message});
      else setMsg({ok: false, text: j.error?.message ?? "Something went wrong. Nothing was charged."});
    } catch { setMsg({ok: false, text: "Network error. Nothing was submitted."}); }
    finally { setBusy(false); }
  }

  return <form className="studio-form" onSubmit={submit} aria-busy={busy}>
    <label>PRODUCT<select name="product" value={slug} onChange={e => setSlug(e.target.value)}>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
    <label>SIZE<select name="size" key={slug} defaultValue={sizes.includes(initialSize ?? "") ? initialSize : sizes[0]} required>{sizes.map(s => <option key={s}>{s}</option>)}</select></label>
    {order ? <>
      <label>FULL NAME<input name="name" autoComplete="name" required minLength={2} /></label>
      <label>PHONE<input name="phone" type="tel" autoComplete="tel" required pattern="\+?\d{10,13}" /></label>
      <label>ADDRESS LINE 1<input name="line1" autoComplete="address-line1" required /></label>
      <label>ADDRESS LINE 2 (OPTIONAL)<input name="line2" autoComplete="address-line2" /></label>
      <label>CITY<input name="city" autoComplete="address-level2" required /></label>
      <label>STATE<input name="state" autoComplete="address-level1" required /></label>
      <label>PINCODE<input name="pincode" autoComplete="postal-code" required pattern="\d{6}" inputMode="numeric" /></label>
      <label><span><input name="accept" type="checkbox" required /> I accept the <a href="/policies" className="text-link">policies</a>.</span></label>
    </> : <label>EMAIL<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
    <button className="button primary-cta" type="submit" disabled={busy}>{busy ? "SENDING…" : order ? "CREATE ORDER" : "JOIN THE WAITLIST"}</button>
    {msg && <p role="status" className="notice" style={msg.ok ? undefined : {borderLeftColor: "var(--rust)"}}>{msg.text}</p>}
  </form>;
}
