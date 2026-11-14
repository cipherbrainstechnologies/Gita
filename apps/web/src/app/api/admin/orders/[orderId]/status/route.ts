import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {advanceOrderSchema} from "@/modules/admin/orders/orders.schema";
import {advanceOrder} from "@/modules/admin/orders/orders.service";

export const dynamic = "force-dynamic";

/** Advance along the allowed lifecycle (PAID → VENDOR_CONFIRMED → IN_PRODUCTION → …). A reason is mandatory and audited. */
export const POST = staffRoute<{orderId: string}>(PERMISSIONS.ordersAdvance, async ({req, staff, params}) => {
  const input = parse(advanceOrderSchema, await readJson(req));
  return jsonResponse(await advanceOrder(staff, params.orderId, input));
});
