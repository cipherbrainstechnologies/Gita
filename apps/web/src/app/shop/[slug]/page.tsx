import {notFound} from "next/navigation";
import Link from "next/link";
import {getProductBySlug} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {GarmentArt} from "@/components/GarmentArt";

export const dynamic = "force-dynamic";
export default async function Product({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  // Orderable requires DB status PREORDER + enabled variant AND the platform checkout flag.
  const buy = p.orderable && checkoutEnabled();
  const q = (size: string) => `/checkout?product=${encodeURIComponent(p.slug)}&size=${encodeURIComponent(size)}`;
  return <div className="pdp page-wrap">
    <div className="pdp-image"><GarmentArt product={p} large /></div>
    <div className="pdp-info">
      <p className="kicker dark">{p.collection} / {p.orderable ? "PREORDER" : "SAMPLE DESIGN"}</p>
      <h1>{p.name}</h1>
      <p className="pdp-line">“{p.line}”</p>
      {p.priceInr !== null && <p className="price-big">₹{p.priceInr.toLocaleString("en-IN")} <small>{buy ? "preorder price; taxes and shipping are itemised at checkout" : "illustrative target price, not an offer"}</small></p>}
      <div className="info-block"><b>ARTWORK</b><p>{p.orderable ? "Artwork approved for production." : "Digital typographic concept. Not a physical sample. Print proof pending."}</p></div>
      <div className="info-block"><b>{buy ? "CHOOSE SIZE" : "FIT / SIZES UNDER REVIEW"}</b>
        <p>{p.fit}{p.sizes.length ? ` · ${buy ? "Available" : "Proposed"} ${p.sizes.join(", ")}.` : ""}{buy ? "" : " Final garment measurements and availability must be confirmed by manufacturer."}</p>
        {p.sizes.length > 0 && <div className="filter-row">{p.sizes.map(s => <Link key={s} href={q(s)}>{s}</Link>)}</div>}
      </div>
      <div className="info-block"><b>PREORDER STATUS</b><p>{buy ? "Preorder is open. Made after you order; dispatch window is confirmed at checkout." : "Not accepting orders. Leave your email and we will tell you if this piece is approved for preorder."}</p></div>
      <Link className={buy ? "primary-cta" : "button-outline"} href={q(p.sizes[0] ?? "M")}>{buy ? "PREORDER" : "JOIN THE WAITLIST"}</Link>
      <p><Link href="/shop" className="text-link">← BACK TO CONCEPTS</Link></p>
    </div>
  </div>;
}
