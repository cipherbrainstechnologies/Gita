import Link from "next/link";
import {getCatalogProducts} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export default async function Shop({searchParams}: {searchParams: Promise<{category?: string}>}) {
  const {category} = await searchParams;
  const all = await getCatalogProducts();
  const products = category === "tees" || category === "pants" ? all.filter(x => x.category === category) : all;
  const live = all.some(p => p.orderable);
  return <div className="page-wrap">
    <p className="kicker dark">{live ? "PREORDER OPEN FOR SELECTED PIECES" : "THE CONCEPT ARCHIVE / NOTHING FOR SALE YET"}</p>
    <h1 className="page-title">All the ideas<span>.</span></h1>
    <p className="page-lead">{all.length} {live ? "pieces" : "examples of the brand direction"}. {live ? "Only items labelled PREORDER can be ordered." : "Prices are illustrative only. Join a waitlist to hear first when manufacturer-approved preorders open."}</p>
    <div className="filter-row"><Link className={!category ? "active" : ""} href="/shop">EVERYTHING</Link><Link className={category === "tees" ? "active" : ""} href="/shop?category=tees">TEES</Link><Link className={category === "pants" ? "active" : ""} href="/shop?category=pants">TRACK PANTS</Link></div>
    <div className="product-grid">{products.map(p => <ProductCard key={p.slug} product={p} />)}</div>
  </div>;
}
