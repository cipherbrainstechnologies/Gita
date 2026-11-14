import Link from 'next/link';
import {gateAdmin} from '@/lib/admin';
import {AdminDenied} from '@/components/admin/AdminGate';
import {StatusChip} from '@/components/admin/StatusChip';
import {loadDashboard,type DashboardDto} from '@/modules/admin/dashboard/dashboard.service';
import {PRODUCT_STATUS_ORDER} from '@/modules/admin/dashboard/dashboard.rules';

export const dynamic='force-dynamic';

const links=[['AI Studio','/admin/studio','Queue draft concepts, watch jobs and review the approval inbox.'],['Content Library','/admin/content','Verify scripture sources, localizations and original editorial lines.'],['Collections','/admin/collections','GITA//CODE, NO EXCUSES, CAMPUS CHAOS and other merch taxonomies.'],['Catalog','/admin/catalog','Edit products, move status gates and enable variants.'],['Orders','/admin/orders','Advance paid orders and record refund requests.'],['Marketing','/admin/marketing','Dated, capped percent-off promotions.'],['Franchise / POS','/admin/franchise','Company-store pilot list. Franchise contracts are blocked by legal.'],['Integrations','/admin/integrations','Encrypted provider credentials and connection tests.']];

export default async function Admin(){
 const gate=await gateAdmin();
 if(gate.state==='unavailable')return <AdminDenied gate={gate} area="the command center"/>;
 if(gate.state==='forbidden')return <div className="page-wrap admin-locked"><p className="kicker dark">RESTRICTED</p><h1 className="page-title">Staff access only<span>.</span></h1><p>Sign in with an approved Google account. Administrator roles must be granted in the database. This site does not permit public self-enrolment as staff.</p><Link href="/login" className="primary-cta">SIGN IN ↗</Link></div>;
 let d:DashboardDto|null=null;
 try{d=await loadDashboard()}catch{d=null}
 return <div className="page-wrap"><p className="kicker dark">OPERATIONS / RESTRICTED · {gate.staff.role.replace(/_/g,' ')}</p><h1 className="page-title">Command center<span>.</span></h1>
  <p className="page-lead">Every figure below is a live database read for your signed-in role; there are no sample numbers. Zero means zero.</p>
  {d===null?<p className="notice">Database unavailable. Live counts cannot be shown.</p>:<>
   <h2 className="admin-h2">Needs attention</h2>
   <div className="admin-stats">
    <Link href="/admin/studio" className="admin-stat"><b>{d.pendingApprovals}</b><span>designs awaiting human review</span></Link>
    <Link href="/admin/studio" className="admin-stat"><b>{d.jobs.queued+d.jobs.running}</b><span>open studio jobs ({d.jobs.queued} queued · {d.jobs.running} running)</span></Link>
    <Link href="/admin/orders" className="admin-stat"><b>{d.orders.placedToday}</b><span>orders placed today IST ({d.orders.paidToday} paid)</span></Link>
    <Link href="/admin/orders" className="admin-stat"><b>{d.orders.awaitingVendorConfirmation}</b><span>paid orders awaiting vendor confirmation</span></Link>
    <Link href="/admin/orders" className="admin-stat"><b>{d.orders.refundPending}</b><span>refund requests pending</span></Link>
   </div>
   <h2 className="admin-h2">Catalog pipeline</h2>
   <div className="admin-stats">
    <Link href="/admin/catalog" className="admin-stat"><b>{d.catalog.conceptSkus}</b><span>concept SKUs (importer)</span></Link>
    <Link href="/admin/catalog" className="admin-stat"><b>{d.catalog.modelFrontApproved}</b><span>front model previews approved</span></Link>
    <Link href="/admin/catalog" className="admin-stat"><b>{d.catalog.modelBackApproved}</b><span>back model previews approved</span></Link>
    <Link href="/admin/catalog" className="admin-stat"><b>{d.catalog.preorderEligibleVariants}</b><span>enabled preorder variants</span></Link>
    <span className="admin-stat"><b>{d.depositPolicy?.flatDepositInr ?? 99}</b><span>deposit (INR) · {d.depositPolicy?.enabled ? (d.depositPolicy.pauseCheckout ? 'configured, paused' : 'enabled') : 'disabled at gateway'}</span></span>
   </div>
   <h2 className="admin-h2">Products by status</h2>
   <div className="admin-stats">{PRODUCT_STATUS_ORDER.map(s=><Link key={s} href="/admin/catalog" className="admin-stat"><b>{d.products[s]}</b><span><StatusChip status={s}/></span></Link>)}</div>
  </>}
  <h2 className="admin-h2">Modules</h2>
  <div className="admin-grid">{links.map(([title,href,desc])=><Link href={href} key={href}><h2>{title} ↗</h2><p>{desc}</p></Link>)}</div>
 </div>}

