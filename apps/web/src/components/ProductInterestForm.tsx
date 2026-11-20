"use client";

import {useState} from "react";

type Props = {
  slug: string;
  sizes: string[];
  productName: string;
};

/** Guest-friendly interest intake — same API as checkout waitlist mode. */
export function ProductInterestForm({slug, sizes, productName}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    const size = String(f.get("size") ?? "M");
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID()},
        body: JSON.stringify({email, productSlug: slug, size}),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg(j.message ?? "Request recorded. No payment was taken.");
      } else {
        setMsg(j.error?.message ?? "Could not save your request. Try again.");
      }
    } catch {
      setMsg("Network error. Nothing was submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="interest-form" onSubmit={submit} aria-busy={busy}>
      <p className="interest-lead">
        <strong>Request this design.</strong> No payment is taken. This is not a confirmed order or manufacturing
        commitment — we only record your size and email so we can notify you if this piece opens for preorder.
      </p>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" />
      </label>
      <label>
        Preferred size
        <select name="size" defaultValue={sizes.includes("M") ? "M" : sizes[0] ?? "M"}>
          {(sizes.length ? sizes : ["XS", "S", "M", "L", "XL", "XXL"]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="primary-cta" disabled={busy}>
        {busy ? "Sending…" : `Request ${productName}`}
      </button>
      {msg && (
        <p role="status" className="notice">
          {msg}
        </p>
      )}
    </form>
  );
}