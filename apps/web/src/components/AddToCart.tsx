"use client";
import Link from "next/link";
import {useState} from "react";

/** Rendered on the PDP only for orderable items. The server re-validates product, size and session. */
export function AddToCart({slug, sizes, signedIn}: {slug: string; sizes: string[]; signedIn: boolean}) {
  const [size, setSize] = useState(sizes[0] ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ok: boolean; text: string} | null>(null);
  if (!signedIn) return <p className="notice">Want to save this for later? <Link className="text-link" href={`/login?callbackUrl=${encodeURIComponent(`/shop/${slug}`)}`}>Sign in</Link> to use the cart.</p>;

  async function add() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/cart", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({productSlug: slug, size, quantity: 1})});
      const j = await res.json().catch(() => ({}));
      setMsg(res.ok ? {ok: true, text: "Added to your cart."} : {ok: false, text: j.error?.message ?? "Could not add to cart."});
    } catch { setMsg({ok: false, text: "Network error. Nothing was added."}); }
    finally { setBusy(false); }
  }

  return <div className="add-to-cart">
    <label>SIZE <select value={size} onChange={e => setSize(e.target.value)}>{sizes.map(s => <option key={s}>{s}</option>)}</select></label>
    <button type="button" className="button-outline" onClick={add} disabled={busy || !size}>{busy ? "ADDING…" : "ADD TO CART"}</button>
    {msg && <p role="status" className="notice" style={msg.ok ? undefined : {borderLeftColor: "var(--rust)"}}>{msg.text}{msg.ok && <> <Link className="text-link" href="/cart">VIEW CART</Link></>}</p>}
  </div>;
}
