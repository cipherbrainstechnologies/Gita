import Link from "next/link";
import {getCatalogProducts} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {CheckoutForm} from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";
export default async function Checkout({searchParams}: {searchParams: Promise<{product?: string; size?: string}>}) {
  const sp = await searchParams;
  const all = await getCatalogProducts();
  const product = all.find(p => p.slug === sp.product) ?? all[0];
  const live = checkoutEnabled() && product.orderable;
  return <div className="page-wrap legal">
    <p className="kicker dark">{live ? "PREORDER" : "WAITLIST / NO PAYMENT TAKEN"}</p>
    <h1 className="page-title">{live ? "Preorder" : "Join the waitlist"}<span>.</span></h1>
    <p className="page-lead">{live
      ? "Preorders are made after you order. Your order is only confirmed once payment is verified by our payment provider."
      : "This piece is a concept. Leave your email and we will contact you only if it is approved for preorder. This is not an order, no payment is taken and no stock is reserved."}</p>
    <CheckoutForm products={all.map(p => ({slug: p.slug, name: p.name, sizes: p.sizes}))} initialSlug={product.slug} initialSize={sp.size} mode={live ? "order" : "waitlist"} />
    <p><Link href="/shop" className="text-link">← BACK TO THE SHOP</Link></p>
  </div>;
}
