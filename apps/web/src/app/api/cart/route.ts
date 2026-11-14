import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {addToCart, getCart, removeFromCart, setCartQuantity, type CartResult} from "@/modules/cart/cart.service";

export const dynamic = "force-dynamic";
const H = {"Cache-Control": "no-store"};
const err = (status: number, code: string, message: string) => NextResponse.json({error: {code, message}}, {status, headers: H});
const unavailable = () => err(503, "CART_UNAVAILABLE", "Cart storage is unavailable. Nothing was changed.");

/** Server session is the only identity source; the customer is never taken from the request body. */
async function guard(): Promise<{email: string} | NextResponse> {
  const email = (await auth())?.user?.email?.trim().toLowerCase();
  if (!email) return err(401, "AUTH_REQUIRED", "Sign in to use the cart.");
  if (!process.env.DATABASE_URL) return unavailable();
  return {email};
}
const respond = <T,>(r: CartResult<T>, status = 200) => r.ok ? NextResponse.json(r.data, {status, headers: H}) : err(r.status, r.code, r.message);
async function body(req: Request): Promise<unknown> { try { return await req.json(); } catch { return undefined; } }

export async function GET() {
  const g = await guard(); if (g instanceof NextResponse) return g;
  try { return NextResponse.json(await getCart(g.email), {headers: H}); } catch { return unavailable(); }
}
export async function POST(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const raw = await body(req); if (raw === undefined) return err(400, "INVALID_JSON", "Request body must be JSON.");
  try { return respond(await addToCart(g.email, raw), 201); } catch { return unavailable(); }
}
export async function PATCH(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const raw = await body(req); if (raw === undefined) return err(400, "INVALID_JSON", "Request body must be JSON.");
  try { return respond(await setCartQuantity(g.email, raw)); } catch { return unavailable(); }
}
export async function DELETE(req: Request) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  try { return respond(await removeFromCart(g.email, id)); } catch { return unavailable(); }
}
