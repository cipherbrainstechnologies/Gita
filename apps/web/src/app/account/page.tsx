import Link from "next/link";
import {DemoBanner} from "@/components/DemoBanner";
import {formatDate} from "@/lib/format";
import {requireCustomer} from "@/modules/account/session";
import {getCustomerProfile} from "@/modules/orders/orders.service";

export const dynamic = "force-dynamic";
export default async function Account() {
  const {email, name} = await requireCustomer("/account");
  const profile = await getCustomerProfile(email);
  const display = profile.displayName ?? name;
  return <div className="page-wrap">
    <p className="kicker dark">ACCOUNT</p>
    <h1 className="page-title">Your corner<span>.</span></h1>
    <DemoBanner />
    <section className="profile-card" aria-label="Profile summary">
      <dl>
        <div><dt>EMAIL</dt><dd>{email}</dd></div>
        <div><dt>NAME</dt><dd>{display ?? "Not provided"}</dd></div>
        {profile.memberSince && <div><dt>CUSTOMER SINCE</dt><dd>{formatDate(profile.memberSince)}</dd></div>}
      </dl>
    </section>
    <div className="admin-grid">
      <Link href="/orders"><h2>Orders</h2><p>Track preorders from payment to delivery.</p></Link>
      <Link href="/account/waitlist"><h2>Waitlist</h2><p>Concepts you asked to hear about. Not orders; no payment taken.</p></Link>
      <Link href="/cart"><h2>Cart</h2><p>Items you saved from pieces open for preorder.</p></Link>
      <Link href="/policies"><h2>Policies</h2><p>Cancellation, refunds, shipping and privacy.</p></Link>
      <Link href="/size-chart"><h2>Size chart</h2><p>How to measure and choose a size.</p></Link>
      <Link href="/contact"><h2>Contact &amp; grievances</h2><p>Reach support or the grievance officer.</p></Link>
    </div>
  </div>;
}
