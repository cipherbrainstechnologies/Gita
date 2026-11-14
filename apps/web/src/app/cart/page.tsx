import Link from "next/link";
import {CartLines} from "@/components/CartLines";
import {DemoBanner} from "@/components/DemoBanner";
import {requireCustomer} from "@/modules/account/session";
import {getCart, type CartView} from "@/modules/cart/cart.service";

export const dynamic = "force-dynamic";
export default async function Cart() {
  const {email} = await requireCustomer("/cart");
  let cart: CartView | null = null;
  if (process.env.DATABASE_URL) { try { cart = await getCart(email); } catch { cart = null; } }
  return <div className="page-wrap">
    <p className="kicker dark"><Link href="/account">ACCOUNT</Link> / CART</p>
    <h1 className="page-title">Your cart<span>.</span></h1>
    <DemoBanner />
    {!cart ? <p className="notice" style={{borderLeftColor: "var(--rust)"}}>Your cart is temporarily unavailable. Please try again shortly.</p>
      : cart.lines.length === 0 ? <div className="empty-state"><p>Your cart is empty. Only pieces open for preorder can be added.</p><Link className="button-outline" href="/shop">BROWSE THE IDEAS</Link></div>
      : <CartLines lines={cart.lines} subtotalPaise={cart.subtotalPaise} />}
  </div>;
}
