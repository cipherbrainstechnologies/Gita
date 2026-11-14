import Link from "next/link";
import {legalEntity, type LegalField} from "@/lib/legal-entity";

export const metadata = {title: "Contact & grievances | VERSE//MODE"};
export const dynamic = "force-dynamic";

const Block = ({title, fields}: {title: string; fields: LegalField[]}) => <section className="info-block">
  <b>{title.toUpperCase()}</b>
  <dl className="kv-list">{fields.map(x => <div key={x.label}><dt>{x.label}</dt><dd className={x.set ? undefined : "placeholder"}>{x.value}</dd></div>)}</dl>
</section>;

export default function Contact() {
  const {entity, support, grievance, complete} = legalEntity();
  return <div className="page-wrap legal">
    <p className="kicker dark">HELP</p>
    <h1 className="page-title">Contact<span>.</span></h1>
    <p className="page-lead">Order help, preorder questions and grievances. Please quote your order reference (VM-…) when you write.</p>
    {!complete && <p className="notice">Some company and contact details are still pending legal entity registration and are shown as placeholders. They will be completed before any preorder opens.</p>}
    <Block title="Seller" fields={entity} />
    <Block title="Customer support" fields={support} />
    <Block title="Grievance officer" fields={grievance} />
    <p>For a complaint, email the grievance officer with your order reference and a description of the issue. Under Indian e-commerce rules a grievance is generally expected to be acknowledged within 48 hours and resolved within one month; the final commitments are set out in our <Link className="text-link" href="/policies">policies</Link> once approved.</p>
    <p><Link className="text-link" href="/size-chart">SIZE CHART</Link> · <Link className="text-link" href="/orders">YOUR ORDERS</Link></p>
  </div>;
}
