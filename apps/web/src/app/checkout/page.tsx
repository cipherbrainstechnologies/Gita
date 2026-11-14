import Link from "next/link";
import {auth} from "@/auth";
import {getCatalogProducts} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {demoActive} from "@/lib/demo";
import {CheckoutForm} from "@/components/CheckoutForm";
import {DemoBanner} from "@/components/DemoBanner";

export const dynamic = "force-dynamic";
export default async function Checkout({searchParams}: {searchParams: Promise<{product?: string; size?: string; qty?: string}>}) {
  const sp = await searchParams;
  const all = await getCatalogProducts();
  const product = all.find(p => p.slug === sp.product) ?? all[0];
  const live = checkoutEnabled() && product.orderable;
  const email = (await auth())?.user?.email?.trim().toLowerCase();
  const qty = Number.parseInt(sp.qty ?? "1", 10);
  return <div className="page-wrap legal">
    <p className="kicker dark">{live ? "PREORDER" : "WAITLIST / NO PAYMENT TAKEN"}</p>
    <h1 className="page-title">{live ? "Preorder" : "Join the waitlist"}<span>.</span></h1>
    <DemoBanner />
    <p className="page-lead">{live
      ? "Preorders are made after you order. Your order is only confirmed once payment is verified by our payment provider."
      : "This piece is a concept. Leave your email and we will contact you only if it is approved for preorder. This is not an order, no payment is taken and no stock is reserved."}</p>
    <CheckoutForm products={(live ? all.filter(p => p.orderable) : all).map(p => ({slug: p.slug, name: p.name, sizes: p.sizes}))} initialSlug={product.slug} initialSize={sp.size} initialQuantity={Number.isFinite(qty) ? qty : 1}
      mode={live ? "order" : "waitlist"} signedIn={Boolean(email)} email={email} demo={demoActive()} />
    <p><Link href="/shop" className="text-link">← BACK TO THE SHOP</Link>{live && <> · <Link href="/cart" className="text-link">CART</Link></>}</p>
  </div>;
}
