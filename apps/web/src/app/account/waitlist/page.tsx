import Link from "next/link";
import {DemoBanner} from "@/components/DemoBanner";
import {getCatalogProducts} from "@/lib/catalog";
import {formatDate} from "@/lib/format";
import {requireCustomer} from "@/modules/account/session";
import {listWaitlistForEmail} from "@/modules/orders/orders.service";

export const dynamic = "force-dynamic";
export default async function AccountWaitlist() {
  const {email} = await requireCustomer("/account/waitlist");
  const [result, catalog] = await Promise.all([listWaitlistForEmail(email), getCatalogProducts()]);
  const name = (slug: string) => catalog.find(p => p.slug === slug)?.name ?? slug;
  return <div className="page-wrap">
    <p className="kicker dark"><Link href="/account">ACCOUNT</Link> / WAITLIST</p>
    <h1 className="page-title">Your waitlist<span>.</span></h1>
    <DemoBanner />
    <p className="page-lead">Waitlist entries record interest only. They are not orders, reserve no stock and take no payment.</p>
    {!result.ok ? <p className="notice" style={{borderLeftColor: "var(--rust)"}}>Your waitlist is temporarily unavailable. Please try again shortly.</p>
      : result.data.length === 0 ? <div className="empty-state"><p>You have not joined any waitlists yet.</p><Link className="button-outline" href="/shop">BROWSE THE IDEAS</Link></div>
      : <ul className="record-list">{result.data.map(w => <li key={w.productSlug}>
          <div><b>{name(w.productSlug)}</b><span>Size {w.size}</span></div>
          <div><span>Joined {formatDate(w.createdAt)}</span><Link className="text-link" href={`/shop/${w.productSlug}`}>VIEW</Link></div>
        </li>)}</ul>}
  </div>;
}
