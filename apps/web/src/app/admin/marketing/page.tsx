import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import MarketingAdmin from "@/components/admin/MarketingAdmin";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {listPromotions, type PromotionDto} from "@/modules/admin/marketing/marketing.service";

export const dynamic = "force-dynamic";

export default async function Marketing() {
  const gate = await gateAdmin(PERMISSIONS.marketingRead);
  if (gate.state !== "ok") return <AdminDenied gate={gate} area="marketing" />;
  const canWrite = (PERMISSIONS.marketingWrite as readonly string[]).includes(gate.staff.role);
  let promotions: PromotionDto[] | null = null;
  try { promotions = await listPromotions(); } catch { promotions = null; }
  return <div className="page-wrap">
    <p className="kicker dark">GROWTH / {canWrite ? "EDITABLE" : "READ-ONLY FOR YOUR ROLE"}</p>
    <h1 className="page-title">Marketing<span>.</span></h1>
    <p className="page-lead">Truthful, dated, capped promotions for adult customers. Dates are entered in India Standard Time and stored with an explicit offset.</p>
    {promotions === null ? <p className="notice">Database unavailable. No promotions can be shown.</p> : <MarketingAdmin promotions={promotions} canWrite={canWrite} />}
    <p className="notice"><b>Stackability:</b> one promotion code per order. A promotion marked <i>exclusive</i> can never be combined with anything else; non-exclusive codes are still not stacked automatically. <b>Not yet enforced at checkout:</b> checkout does not apply promotions today, so “LIVE” here means the record is within its window, not that customers receive a discount. The 30-day price-history comparator required for “was/now” savings claims is also pending (E16). Redeemed promotions are locked against edits to rule and code.</p>
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
