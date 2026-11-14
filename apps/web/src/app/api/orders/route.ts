import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {listOrdersForEmail} from "@/modules/orders/orders.service";

export const dynamic = "force-dynamic";
const H = {"Cache-Control": "no-store"};

/** Orders for the authenticated customer only (identity = server session email). Money is integer paise as strings. No address data is returned. */
export async function GET() {
  const email = (await auth())?.user?.email;
  if (!email) return NextResponse.json({error: {code: "AUTH_REQUIRED", message: "Authentication required"}}, {status: 401, headers: H});
  const r = await listOrdersForEmail(email);
  if (!r.ok) return NextResponse.json({error: {code: "ORDERS_UNAVAILABLE", message: "Orders are temporarily unavailable."}}, {status: 503, headers: H});
  return NextResponse.json({orders: r.data}, {headers: H});
}
