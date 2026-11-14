import Link from "next/link";
import {canAdmin} from "@/lib/admin";
import {prisma} from "@/lib/db";

export const dynamic = "force-dynamic";
const tone: Record<string, string> = {CONCEPT: "#e7e5df", SAMPLE_PENDING: "#eadfb8", SAMPLE_APPROVED: "#d5e3b0", PREORDER: "#c6f268", CLOSED: "#d9d2cf", ARCHIVED: "#cfcfcf"};
const inr = (p: bigint) => `₹${(Number(p) / 100).toLocaleString("en-IN")}`;

export default async function AdminCatalog() {
  if (!await canAdmin()) return <div className="page-wrap">Forbidden</div>;
  let rows: Awaited<ReturnType<typeof load>> | null = null;
  try { rows = await load(); } catch { rows = null; }
  return <div className="page-wrap">
    <p className="kicker dark">MERCHANDISING / READ-ONLY</p>
    <h1 className="page-title">Catalog<span>.</span></h1>
    {rows === null ? <p className="notice">Database unavailable. No catalog data can be shown.</p>
      : rows.length === 0 ? <p className="notice">No products in the database yet. Run <code>npm run db:seed:catalog</code> to load CONCEPT records. Storefront falls back to non-orderable samples.</p>
      : <div style={{overflowX: "auto"}}><table style={{width: "100%", borderCollapse: "collapse", fontSize: 14}}>
        <thead><tr style={{textAlign: "left", borderBottom: "2px solid var(--ink)"}}><th>PRODUCT</th><th>STATUS</th><th>VARIANTS</th><th>ENABLED</th><th>PRICE</th><th>UPDATED</th></tr></thead>
        <tbody>{rows.map(p => {
          const prices = p.variants.map(v => v.pricePaise).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
          const on = p.variants.filter(v => v.enabled).length;
          return <tr key={p.id} style={{borderBottom: "1px solid var(--line)"}}>
            <td style={{padding: "12px 8px"}}><b>{p.title}</b><br /><small>{p.slug}</small></td>
            <td><span className="chip" style={{position: "static", display: "inline-block", background: tone[p.status]}}>{p.status.replace(/_/g, " ")}</span></td>
            <td>{p.variants.length}</td>
            <td>{on}{p.status !== "PREORDER" && on > 0 ? " ⚠ not PREORDER" : ""}</td>
            <td>{prices.length ? (prices[0] === prices[prices.length - 1] ? inr(prices[0]) : `${inr(prices[0])}–${inr(prices[prices.length - 1])}`) : "—"}</td>
            <td>{p.updatedAt.toISOString().slice(0, 10)}</td></tr>;
        })}</tbody></table></div>}
    <p className="notice">Read-only. Status changes, variant enablement and pricing are not editable here yet; a product is orderable only when status is PREORDER, a variant is enabled and supplier-confirmed capacity exists.</p>
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
function load() { return prisma.product.findMany({include: {variants: {select: {pricePaise: true, enabled: true}}}, orderBy: [{status: "asc"}, {createdAt: "asc"}]}); }
