import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {refundRequestSchema} from "@/modules/admin/orders/orders.schema";
import {requestRefund} from "@/modules/admin/orders/orders.service";

export const dynamic = "force-dynamic";

/** Records a REFUND_PENDING request only. Never calls the payment provider; nothing is reported as refunded. */
export const POST = staffRoute<{orderId: string}>(PERMISSIONS.ordersRefund, async ({req, staff, params}) => {
  const input = parse(refundRequestSchema, await readJson(req));
  return jsonResponse(await requestRefund(staff, params.orderId, input), 201);
});
