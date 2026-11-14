import {staffRoute, jsonResponse, parse} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {listOrdersQuerySchema} from "@/modules/admin/orders/orders.schema";
import {listOrders} from "@/modules/admin/orders/orders.service";

export const dynamic = "force-dynamic";

/** Recent orders: status, totals (paise as strings), customer email, payment status. No delivery address, no payment secrets. */
export const GET = staffRoute(PERMISSIONS.ordersRead, async ({req}) => {
  const sp = new URL(req.url).searchParams;
  const q = parse(listOrdersQuerySchema, {status: sp.get("status") ?? undefined, q: sp.get("q") ?? undefined, limit: sp.get("limit") ?? undefined});
  return jsonResponse({orders: await listOrders(q)});
});
