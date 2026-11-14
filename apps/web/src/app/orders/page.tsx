import Link from "next/link";
import {DemoBanner} from "@/components/DemoBanner";
import {OrderCard} from "@/components/OrderCard";
import {demoActive} from "@/lib/demo";
import {requireCustomer} from "@/modules/account/session";
import {listOrdersForEmail, sampleOrder} from "@/modules/orders/orders.service";

export const dynamic = "force-dynamic";
export default async function Orders() {
  const {email} = await requireCustomer("/orders");
  const result = await listOrdersForEmail(email);
  const orders = result.ok ? result.data : [];
  // Demo-only: when the customer has no real orders, show one clearly-labelled sample so the timeline can be reviewed.
  const shown = result.ok && orders.length === 0 && demoActive() ? [sampleOrder()] : orders;
  return <div className="page-wrap">
    <p className="kicker dark"><Link href="/account">ACCOUNT</Link> / ORDERS</p>
    <h1 className="page-title">Your orders<span>.</span></h1>
    <DemoBanner />
    {!result.ok ? <p className="notice" style={{borderLeftColor: "var(--rust)"}}>Your orders are temporarily unavailable. Please try again shortly.</p>
      : shown.length === 0 ? <div className="empty-state"><p>You have no orders yet. Preorders appear here, with their progress, as soon as you place one.</p><Link className="button-outline" href="/shop">BROWSE THE IDEAS</Link></div>
      : <div className="order-list">{shown.map(o => <OrderCard key={o.publicId} order={o} />)}</div>}
  </div>;
}
