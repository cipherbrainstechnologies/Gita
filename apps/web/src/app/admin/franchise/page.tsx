import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import CompanyStoreForm from "@/components/admin/CompanyStoreForm";
import {StatusChip} from "@/components/admin/StatusChip";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {listStores, type StoreDto} from "@/modules/admin/franchise/franchise.service";

export const dynamic = "force-dynamic";

export default async function Franchise() {
  const gate = await gateAdmin(PERMISSIONS.franchiseRead);
  if (gate.state !== "ok") return <AdminDenied gate={gate} area="franchise / POS" />;
  const canWrite = (PERMISSIONS.franchiseWrite as readonly string[]).includes(gate.staff.role);
  let stores: StoreDto[] | null = null;
  try { stores = await listStores(); } catch { stores = null; }
  return <div className="page-wrap">
    <p className="kicker dark">RETAIL / READ-ONLY LIST</p>
    <h1 className="page-title">Franchise / POS<span>.</span></h1>
    <p className="notice"><b>Franchise contracts are blocked by legal review (E21).</b> Only a single company-operated store pilot can be set up, and only in demo mode. Franchise stores, commissions and settlements cannot be created from here, and storefront stock is never shared with store stock.</p>
    {stores === null ? <p className="notice">Database unavailable. No store data can be shown.</p> : stores.length === 0 ? <p className="notice">No stores exist yet.</p> :
      <div className="admin-scroll"><table className="admin-table"><thead><tr><th>STORE</th><th>TYPE</th><th>LEGAL OWNER</th><th>GSTIN</th><th>STATE</th><th>PHYSICAL STOCK</th><th>AGREEMENTS</th></tr></thead><tbody>
        {stores.map(s => <tr key={s.id}><td><b>{s.name}</b><br /><small>{s.slug}{s.address?.city ? ` · ${s.address.city}` : ""}</small></td><td>{s.storeType}{s.storeType !== "COMPANY" && <><br /><small className="admin-warn">blocked: legal</small></>}</td><td>{s.legalOwner}</td><td>{s.gstin ?? "—"}</td>
          <td><StatusChip status={s.active ? "OK" : "WARN"} label={s.active ? "ACTIVE" : "INACTIVE"} /></td><td>{s.stock.skus ? `${s.stock.onHand} on hand / ${s.stock.reserved} reserved (${s.stock.skus} SKUs)` : "no ledger rows"}</td><td>{s.agreements}</td></tr>)}
      </tbody></table></div>}
    {canWrite && demoAuth() && <CompanyStoreForm />}
    {canWrite && !demoAuth() && <p className="notice">Store creation is disabled: <code>DEMO_AUTH</code> is not enabled in this environment.</p>}
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
