import Link from "next/link";
import {auth} from "@/auth";
import {adminRole} from "@/lib/admin";
import {withTimeout} from "@/lib/config";
import {demoActive} from "@/lib/demo";

/** True only for a signed-in account that maps to an ACTIVE AdminUser. */
async function staffSession(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.email) return false;
    return (await withTimeout(adminRole(), 1500)) !== null;
  } catch {
    return false;
  }
}

export async function Header() {
  const session = await auth().catch(() => null);
  const staff = await staffSession();
  const signedIn = Boolean(session?.user?.email);
  return (
    <>
      <div className="announcement">
        {demoActive()
          ? "DEMO STORE · PAYMENTS AND SHIPPING ARE NOT LIVE"
          : "PREORDER-FIRST APPAREL · MADE AFTER YOU ORDER · INDIA"}
      </div>
      <header className="site-header">
        <Link href="/" className="logo" aria-label="Verse Mode home">
          VERSE<span>{"//"}</span>MODE
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          <Link href="/shop">SHOP THE IDEAS</Link>
          <Link href="/shop?category=tees">TEES</Link>
          <Link href="/shop?category=pants">TRACK PANTS</Link>
          <Link href="/inspiration">VERSE LIBRARY</Link>
          <Link href="/how-preorder-works">HOW IT WORKS</Link>
        </nav>
        <div className="header-actions">
          <Link href="/cart">CART</Link>
          {signedIn ? <Link href="/account">ACCOUNT</Link> : <Link href="/login">SIGN IN</Link>}
          {staff && (
            <Link href="/admin" aria-label="Staff command center">
              STAFF ↗
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
