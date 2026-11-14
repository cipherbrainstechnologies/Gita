"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {adminFetch, describeFailure} from "./adminFetch";

export default function CompanyStoreForm() {
  const router = useRouter();
  const [f, setF] = useState({slug: "", name: "", legalOwner: "", line1: "", city: "", state: "", pincode: "", gstin: ""});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{kind: "ok" | "err"; text: string} | null>(null);
  const set = (k: keyof typeof f) => (e: {target: {value: string}}) => setF({...f, [k]: e.target.value});
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await adminFetch("POST", "/api/admin/franchise/stores", {slug: f.slug, name: f.name, legalOwner: f.legalOwner, address: {line1: f.line1, city: f.city, state: f.state, pincode: f.pincode}, gstin: f.gstin.trim() === "" ? null : f.gstin});
    if (r.ok) { setMsg({kind: "ok", text: "Pilot store created (inactive, company-owned)."}); router.refresh(); } else setMsg({kind: "err", text: describeFailure(r)});
    setBusy(false);
  }
  return <form className="admin-form admin-card" onSubmit={submit}>
    <h3>New company-store pilot <small>(DEMO_AUTH only)</small></h3>
    <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={f.slug} onChange={set("slug")} placeholder="pilot-store-01" /></label>
    <label>Store name<input required minLength={2} value={f.name} onChange={set("name")} /></label>
    <label>Legal owner (operating entity)<input required minLength={2} value={f.legalOwner} onChange={set("legalOwner")} /></label>
    <label>Address line<input required minLength={3} value={f.line1} onChange={set("line1")} /></label>
    <label>City<input required value={f.city} onChange={set("city")} /></label>
    <label>State<input required value={f.state} onChange={set("state")} /></label>
    <label>Pincode<input required inputMode="numeric" pattern="\d{6}" value={f.pincode} onChange={set("pincode")} /></label>
    <label>GSTIN (optional)<input value={f.gstin} onChange={set("gstin")} maxLength={15} /></label>
    <button className="primary-cta button" disabled={busy}>{busy ? "CREATING…" : "CREATE PILOT STORE ↗"}</button>
    {msg && <output className={msg.kind === "err" ? "admin-error" : "admin-ok"} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</output>}
  </form>;
}
