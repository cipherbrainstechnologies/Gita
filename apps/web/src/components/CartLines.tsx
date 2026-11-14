"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {formatPaise} from "@/lib/format";
import type {CartLine} from "@/modules/cart/cart.service";

/** Cart rows with quantity/remove. Each row buys one line via the single-item checkout; totals shown are informational (tax-inclusive). */
export function CartLines({lines, subtotalPaise}: {lines: CartLine[]; subtotalPaise: string}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(id: string, init: RequestInit, url = "/api/cart") {
    setBusy(id); setError(null);
    try {
      const res = await fetch(url, {...init, headers: {"Content-Type": "application/json"}});
      if (!res.ok) setError((await res.json().catch(() => ({}))).error?.message ?? "Could not update the cart.");
      else router.refresh();
    } catch { setError("Network error. Cart unchanged."); }
    finally { setBusy(null); }
  }

  return <div>
    <ul className="record-list">{lines.map(l => <li key={l.id} aria-busy={busy === l.id}>
      <div><b>{l.name}</b><span>Size {l.size}{l.available ? "" : ` · ${l.reason}`}</span></div>
      <div className="cart-controls">
        <label className="sr-label">Qty
          <select value={l.quantity} disabled={busy === l.id} onChange={e => call(l.id, {method: "PATCH", body: JSON.stringify({id: l.id, quantity: Number(e.target.value)})})}>
            {[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></label>
        <span>{l.linePaise ? formatPaise(l.linePaise) : "—"}</span>
        {l.available && <Link className="text-link" href={`/checkout?product=${encodeURIComponent(l.productSlug)}&size=${encodeURIComponent(l.size)}&qty=${l.quantity}`}>PREORDER</Link>}
        <button type="button" className="link-button" disabled={busy === l.id} onClick={() => call(l.id, {method: "DELETE"}, `/api/cart?id=${encodeURIComponent(l.id)}`)}>REMOVE</button>
      </div>
    </li>)}</ul>
    <p className="cart-total"><b>Subtotal (incl. tax): {formatPaise(subtotalPaise)}</b></p>
    <p className="notice">Prices are confirmed at checkout. Items are not reserved while in your cart, and each item is preordered separately.</p>
    {error && <p role="alert" className="notice" style={{borderLeftColor: "var(--rust)"}}>{error}</p>}
  </div>;
}
