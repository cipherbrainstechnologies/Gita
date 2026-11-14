import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import CatalogAdmin from "@/components/admin/CatalogAdmin";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {listCatalog, type ProductDto} from "@/modules/admin/catalog/catalog.service";

export const dynamic = "force-dynamic";

export default async function AdminCatalog() {
  const gate = await gateAdmin(PERMISSIONS.catalogRead);
  if (gate.state !== "ok") return <AdminDenied gate={gate} area="the catalog" />;
  const canWrite = (PERMISSIONS.catalogWrite as readonly string[]).includes(gate.staff.role);
  let products: ProductDto[] | null = null;
  try { products = await listCatalog(); } catch { products = null; }
  return <div className="page-wrap">
    <p className="kicker dark">MERCHANDISING / {canWrite ? "EDITABLE" : "READ-ONLY FOR YOUR ROLE"}</p>
    <h1 className="page-title">Catalog<span>.</span></h1>
    <p className="page-lead">A product is sellable only when its status is <b>PREORDER</b>, a variant is enabled <i>and</i> supplier-confirmed capacity exists. Concepts never take orders.</p>
    {products === null ? <p className="notice">Database unavailable. No catalog data can be shown.</p> : <CatalogAdmin products={products} canWrite={canWrite} demoAuth={demoAuth()} />}
    <p className="notice">Status path: CONCEPT → SAMPLE PENDING → SAMPLE APPROVED → PREORDER. PREORDER requires an HSN code, a variant tax rate and confirmed capacity (capacity rows come from the supplier/operations process, not from this screen). Every change is written to the audit log.</p>
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
