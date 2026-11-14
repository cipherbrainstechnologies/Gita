"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {adminFetch, describeFailure} from "./adminFetch";
import {StatusChip} from "./StatusChip";
import {formatInr, inrToPaise} from "@/lib/money";
import {PROMOTION_KINDS} from "@/modules/admin/marketing/marketing.rules";
import type {PromotionDto} from "@/modules/admin/marketing/marketing.service";

const IST = {timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"} as const;
const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", IST) + " IST";
/** `datetime-local` has no zone; staff enter India time, so the explicit +05:30 offset is attached here. */
const istToIso = (v: string) => `${v}:00+05:30`;
const PHASE_TONE: Record<string, string> = {LIVE: "OK", SCHEDULED: "WARN", INACTIVE: "CONCEPT", EXPIRED: "ARCHIVED"};

function Create() {
  const router = useRouter();
  const [f, setF] = useState({code: "", label: "", kind: "LAUNCH", startsAt: "", endsAt: "", percentOff: "10", exclusive: false, maxRedemptions: "", minOrder: "", active: false});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{kind: "ok" | "err"; text: string} | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const minOrder = f.minOrder.trim() === "" ? null : inrToPaise(f.minOrder);
    if (f.minOrder.trim() !== "" && minOrder === null) { setMsg({kind: "err", text: "Minimum order must be rupees with at most 2 decimals."}); return; }
    setBusy(true); setMsg(null);
    const r = await adminFetch("POST", "/api/admin/marketing/promotions", {
      code: f.code, label: f.label, kind: f.kind, startsAt: istToIso(f.startsAt), endsAt: istToIso(f.endsAt), percentOff: Number(f.percentOff), active: f.active, exclusive: f.exclusive,
      maxRedemptions: f.maxRedemptions === "" ? null : Number(f.maxRedemptions), minOrderPaise: minOrder === null ? null : minOrder.toString()
    });
    if (r.ok) { setMsg({kind: "ok", text: "Promotion saved."}); router.refresh(); } else setMsg({kind: "err", text: describeFailure(r)});
    setBusy(false);
  }
  const set = (k: keyof typeof f) => (e: {target: {value: string}}) => setF({...f, [k]: e.target.value});
  return <form className="admin-form admin-card" onSubmit={submit}>
    <h3>New promotion</h3>
    <label>Code<input required value={f.code} onChange={set("code")} pattern="[A-Za-z0-9][A-Za-z0-9_\-]{2,31}" placeholder="LAUNCH10" /></label>
    <label>Label (shown to customers)<input required minLength={2} maxLength={120} value={f.label} onChange={set("label")} /></label>
    <label>Kind<select value={f.kind} onChange={set("kind")}>{PROMOTION_KINDS.map(k => <option key={k}>{k}</option>)}</select></label>
    <label>Starts (IST)<input required type="datetime-local" value={f.startsAt} onChange={set("startsAt")} /></label>
    <label>Ends (IST)<input required type="datetime-local" value={f.endsAt} onChange={set("endsAt")} /></label>
    <label>Percent off (1–70)<input required type="number" min={1} max={70} step={1} value={f.percentOff} onChange={set("percentOff")} /></label>
    <label>Minimum order (₹, optional)<input inputMode="decimal" value={f.minOrder} onChange={set("minOrder")} /></label>
    <label>Max redemptions (optional)<input type="number" min={1} value={f.maxRedemptions} onChange={set("maxRedemptions")} /></label>
    <label className="check"><input type="checkbox" checked={f.exclusive} onChange={e => setF({...f, exclusive: e.target.checked})} />Exclusive (cannot be combined with any other code)</label>
    <label className="check"><input type="checkbox" checked={f.active} onChange={e => setF({...f, active: e.target.checked})} />Activate immediately (still limited to the dates above)</label>
    <button className="primary-cta button" disabled={busy}>{busy ? "SAVING…" : "SAVE PROMOTION ↗"}</button>
    {msg && <output className={msg.kind === "err" ? "admin-error" : "admin-ok"} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</output>}
  </form>;
}

function Row({p}: {p: PromotionDto}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function call(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true); setErr("");
    const r = await adminFetch(method, `/api/admin/marketing/promotions/${encodeURIComponent(p.id)}`, body);
    if (r.ok) router.refresh(); else setErr(describeFailure(r));
    setBusy(false);
  }
  return <tr>
    <td><b>{p.code}</b><br /><small>{p.label}</small></td>
    <td>{p.kind}</td>
    <td><StatusChip status={PHASE_TONE[p.phase]} label={p.phase} /></td>
    <td>{p.percentOff == null ? "—" : `${p.percentOff}% off`}{p.minOrderPaise ? <><br /><small>min {formatInr(p.minOrderPaise)}</small></> : null}</td>
    <td><small>{fmt(p.startsAt)}<br />→ {fmt(p.endsAt)}</small></td>
    <td>{p.exclusive ? "exclusive" : "1 code / order"}</td>
    <td>{p.redemptions}{p.maxRedemptions ? ` / ${p.maxRedemptions}` : ""}</td>
    <td><span className="admin-actions">
      <button type="button" className="button-outline small" disabled={busy || p.phase === "EXPIRED"} onClick={() => call("PATCH", {active: !p.active})}>{p.active ? "DEACTIVATE" : "ACTIVATE"}</button>
      <button type="button" className="button-outline small" disabled={busy || p.redemptions > 0} onClick={() => { if (confirm(`Delete ${p.code}?`)) void call("DELETE"); }}>DELETE</button></span>
      {err && <output className="admin-error" role="alert">{err}</output>}</td>
  </tr>;
}

export default function MarketingAdmin({promotions, canWrite}: {promotions: PromotionDto[]; canWrite: boolean}) {
  return <div className="admin-stack">
    {canWrite && <Create />}
    {promotions.length === 0 ? <p className="notice">No promotions exist.</p> :
      <div className="admin-scroll"><table className="admin-table"><thead><tr><th>CODE</th><th>KIND</th><th>PHASE</th><th>DISCOUNT</th><th>WINDOW</th><th>STACKING</th><th>USED</th><th>{canWrite ? "ACTIONS" : ""}</th></tr></thead>
        <tbody>{promotions.map(p => canWrite ? <Row key={p.id} p={p} /> : <tr key={p.id}><td><b>{p.code}</b><br /><small>{p.label}</small></td><td>{p.kind}</td><td><StatusChip status={PHASE_TONE[p.phase]} label={p.phase} /></td><td>{p.percentOff ?? "—"}%</td><td><small>{fmt(p.startsAt)} → {fmt(p.endsAt)}</small></td><td>{p.exclusive ? "exclusive" : "1 code / order"}</td><td>{p.redemptions}</td><td /></tr>)}</tbody></table></div>}
  </div>;
}

