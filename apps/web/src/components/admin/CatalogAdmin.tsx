"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {adminFetch, describeFailure, percentToBasisPoints} from "./adminFetch";
import {StatusChip} from "./StatusChip";
import {formatInr, inrToPaise} from "@/lib/money";
import {BLOCKER_MESSAGES} from "@/modules/admin/catalog/catalog.rules";
import type {ProductDto, VariantDto} from "@/modules/admin/catalog/catalog.service";

type Props = {products: ProductDto[]; canWrite: boolean; demoAuth: boolean};

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{kind: "ok" | "err"; text: string} | null>(null);
  async function run(method: "POST" | "PATCH", url: string, body: unknown, okText: string) {
    setBusy(true); setMsg(null);
    const r = await adminFetch(method, url, body);
    if (r.ok) { setMsg({kind: "ok", text: okText}); router.refresh(); } else setMsg({kind: "err", text: describeFailure(r)});
    setBusy(false);
    return r.ok;
  }
  return {busy, msg, setMsg, run};
}

const Msg = ({m}: {m: {kind: "ok" | "err"; text: string} | null}) => m ? <output className={m.kind === "err" ? "admin-error" : "admin-ok"} role={m.kind === "err" ? "alert" : "status"}>{m.text}</output> : null;

function NewProduct() {
  const {busy, msg, run} = useAction();
  const [f, setF] = useState({slug: "", title: "", tagline: "", category: "tees", hsnCode: ""});
  const set = (k: keyof typeof f) => (e: {target: {value: string}}) => setF({...f, [k]: e.target.value});
  return <details className="admin-card"><summary>+ NEW CONCEPT PRODUCT</summary>
    <form className="admin-form" onSubmit={async e => { e.preventDefault(); if (await run("POST", "/api/admin/catalog", {...f, hsnCode: f.hsnCode || null, tagline: f.tagline || null}, "Concept created. It is NOT orderable.")) setF({slug: "", title: "", tagline: "", category: "tees", hsnCode: ""}); }}>
      <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={f.slug} onChange={set("slug")} placeholder="quiet-is-a-power-move" /></label>
      <label>Title<input required minLength={2} maxLength={160} value={f.title} onChange={set("title")} /></label>
      <label>Tagline<input maxLength={200} value={f.tagline} onChange={set("tagline")} /></label>
      <label>Category<select value={f.category} onChange={set("category")}><option value="tees">Tees</option><option value="pants">Track pants</option></select></label>
      <label>HSN (optional now, required for PREORDER)<input inputMode="numeric" pattern="\d{4}(\d{2}){0,2}" value={f.hsnCode} onChange={set("hsnCode")} /></label>
      <button className="primary-cta button" disabled={busy}>{busy ? "SAVING…" : "CREATE CONCEPT ↗"}</button><Msg m={msg} />
    </form></details>;
}

function Variants({p, canWrite}: {p: ProductDto; canWrite: boolean}) {
  const {busy, msg, setMsg, run} = useAction();
  const [v, setV] = useState({sku: "", size: "M", colour: "", fit: "", mrp: "", price: "", tax: ""});
  const set = (k: keyof typeof v) => (e: {target: {value: string}}) => setV({...v, [k]: e.target.value});
  const edit = (x: VariantDto) => setV({sku: x.sku, size: x.size, colour: x.colour, fit: x.fit, mrp: String(Number(x.mrpPaise) / 100), price: String(Number(x.pricePaise) / 100), tax: x.taxRateBasisPoints == null ? "" : String(x.taxRateBasisPoints / 100)});
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const mrp = inrToPaise(v.mrp), price = inrToPaise(v.price), tax = v.tax.trim() === "" ? null : percentToBasisPoints(v.tax);
    if (mrp === null || price === null || (v.tax.trim() !== "" && tax === null)) { setMsg({kind: "err", text: "Enter prices as rupees (max 2 decimals) and GST as a percentage such as 5 or 12."}); return; }
    await run("POST", "/api/admin/catalog/variants", {productId: p.id, sku: v.sku, size: v.size, colour: v.colour, fit: v.fit, mrpPaise: mrp.toString(), pricePaise: price.toString(), taxRateBasisPoints: tax}, "Variant saved (enabled state unchanged).");
  }
  return <div>
    <h4>Variants</h4>
    {p.variants.length === 0 ? <p className="notice">No variants yet. A product cannot be enabled for sale without at least one variant.</p> :
      <div className="admin-scroll"><table className="admin-table"><thead><tr><th>SKU</th><th>SIZE</th><th>PRICE</th><th>MRP</th><th>TAX</th><th>CONFIRMED CAPACITY</th><th>STATE</th>{canWrite && <th />}</tr></thead><tbody>
        {p.variants.map(x => <tr key={x.id}>
          <td>{x.sku}</td><td>{x.size}</td><td>{formatInr(x.pricePaise)}</td><td>{formatInr(x.mrpPaise)}</td>
          <td>{x.taxRateBasisPoints == null ? "—" : `${x.taxRateBasisPoints / 100}%`}</td>
          <td>{x.capacityRemaining == null ? "none confirmed" : `${x.capacityRemaining} left`}</td>
          <td><b>{x.enabled ? "ENABLED" : "disabled"}</b></td>
          {canWrite && <td className="admin-actions">
            <button type="button" className="button-outline small" disabled={busy} onClick={() => run("PATCH", "/api/admin/catalog/variants", {sku: x.sku, enabled: !x.enabled}, x.enabled ? "Variant disabled." : "Variant enabled.")}>{x.enabled ? "DISABLE" : "ENABLE"}</button>
            <button type="button" className="button-outline small" onClick={() => edit(x)}>EDIT</button></td>}
        </tr>)}</tbody></table></div>}
    {canWrite && <form className="admin-form" onSubmit={save}>
      <label>SKU<input required value={v.sku} onChange={set("sku")} placeholder="VM-SLUG-M" /></label>
      <label>Size<input required maxLength={8} value={v.size} onChange={set("size")} /></label>
      <label>Colour<input required value={v.colour} onChange={set("colour")} /></label>
      <label>Fit<input required value={v.fit} onChange={set("fit")} /></label>
      <label>MRP (₹)<input required inputMode="decimal" value={v.mrp} onChange={set("mrp")} /></label>
      <label>Price (₹, tax-inclusive)<input required inputMode="decimal" value={v.price} onChange={set("price")} /></label>
      <label>GST % (blank = unset)<input inputMode="decimal" value={v.tax} onChange={set("tax")} /></label>
      <button className="primary-cta button" disabled={busy}>{busy ? "SAVING…" : "SAVE VARIANT ↗"}</button><Msg m={msg} />
    </form>}
  </div>;
}

function ProductPanel({p, canWrite, demoAuth}: {p: ProductDto; canWrite: boolean; demoAuth: boolean}) {
  const edit = useAction(), move = useAction();
  const [f, setF] = useState({title: p.title, tagline: p.tagline ?? "", description: p.description ?? "", hsnCode: p.hsnCode ?? ""});
  const [chosen, setTo] = useState<string>("");
  const to = p.allowedTransitions.find(s => s === chosen) ?? p.allowedTransitions[0] ?? "";
  const [reason, setReason] = useState("");
  const [demo, setDemo] = useState(false);
  const prices = p.variants.map(x => BigInt(x.pricePaise)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const enabled = p.variants.filter(x => x.enabled).length;
  return <details className="admin-card">
    <summary><b>{p.title}</b> <small>{p.slug}</small> <StatusChip status={p.status} /> <small>{enabled}/{p.variants.length} variants enabled{prices.length ? ` · ${formatInr(prices[0])}${prices[0] !== prices[prices.length - 1] ? "–" + formatInr(prices[prices.length - 1]) : ""}` : ""}</small></summary>
    {p.status !== "PREORDER" && enabled > 0 && <p className="notice">Variants are enabled but the product is {p.status}: the storefront will NOT sell them.</p>}
    {canWrite && <>
      <form className="admin-form" onSubmit={e => { e.preventDefault(); void edit.run("PATCH", "/api/admin/catalog", {id: p.id, title: f.title, tagline: f.tagline, description: f.description, hsnCode: f.hsnCode === "" ? null : f.hsnCode}, "Product saved."); }}>
        <label>Title<input required minLength={2} value={f.title} onChange={e => setF({...f, title: e.target.value})} /></label>
        <label>Tagline<input value={f.tagline} onChange={e => setF({...f, tagline: e.target.value})} /></label>
        <label>HSN<input inputMode="numeric" value={f.hsnCode} onChange={e => setF({...f, hsnCode: e.target.value})} /></label>
        <label>Description<input value={f.description} onChange={e => setF({...f, description: e.target.value})} /></label>
        <button className="primary-cta button" disabled={edit.busy || p.status === "ARCHIVED"}>{edit.busy ? "SAVING…" : "SAVE DETAILS ↗"}</button><Msg m={edit.msg} />
      </form>
      <h4>Status</h4>
      {p.allowedTransitions.length === 0 ? <p className="notice">No further transitions: ARCHIVED is final.</p> :
        <form className="admin-form" onSubmit={e => { e.preventDefault(); if (to) void move.run("PATCH", "/api/admin/catalog", {id: p.id, status: to, reason: reason || undefined, demoAllowPreorder: demo || undefined}, `Moved to ${to}.`); }}>
          <label>Move to<select value={to} onChange={e => setTo(e.target.value)}>{p.allowedTransitions.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          <label>Reason (logged to audit)<input value={reason} onChange={e => setReason(e.target.value)} minLength={3} maxLength={500} /></label>
          {to === "PREORDER" && !p.preorderGate.ok && <ul className="admin-blockers">{p.preorderGate.blockers.map(b => <li key={b}>{BLOCKER_MESSAGES[b]}</li>)}</ul>}
          {to === "PREORDER" && demoAuth && <label className="check"><input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)} />DEMO ONLY: waive the capacity check (checkout still refuses orders without real confirmed capacity)</label>}
          <button className="primary-cta button" disabled={move.busy || !to}>{move.busy ? "MOVING…" : "APPLY STATUS ↗"}</button><Msg m={move.msg} />
        </form>}
    </>}
    <Variants p={p} canWrite={canWrite} />
  </details>;
}

export default function CatalogAdmin({products, canWrite, demoAuth}: Props) {
  return <div className="admin-stack">
    {canWrite && <NewProduct />}
    {products.length === 0 ? <p className="notice">No products in the database yet. Create a concept above or run <code>npm run db:seed:catalog</code>.</p> : products.map(p => <ProductPanel key={p.id} p={p} canWrite={canWrite} demoAuth={demoAuth} />)}
  </div>;
}

