import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {ApiError} from "../shared/http";
import {writeAudit} from "../shared/audit";
import {ORDER_TRANSITIONS, TERMINAL_REFUND_STATUSES, canAdvance, canRequestRefund, type OrderStatus} from "./orders.rules";
import type {AdvanceOrderInput, ListOrdersQuery, RefundRequestInput} from "./orders.schema";
import * as repo from "./orders.repository";

export type OrderDto = {
  id: string; publicId: string; status: OrderStatus; version: number; createdAt: string; paidAt: string | null;
  subtotalPaise: string; discountPaise: string; shippingPaise: string; taxPaise: string; totalPaise: string;
  customerEmail: string | null; itemCount: number; paymentStatus: string | null;
  shipWindow: {from: string; to: string} | null;
  allowedTransitions: OrderStatus[]; refundOpen: boolean; canRequestRefund: boolean;
};

function shipWindow(v: unknown): OrderDto["shipWindow"] {
  const o = v as {from?: unknown; to?: unknown} | null;
  return o && typeof o.from === "string" && typeof o.to === "string" ? {from: o.from, to: o.to} : null;
}

/** Recent orders for staff. The encrypted delivery address is deliberately never selected into the DTO. */
export async function listOrders(q: Partial<ListOrdersQuery> = {}): Promise<OrderDto[]> {
  const where: Prisma.OrderWhereInput = {};
  if (q.status) where.status = q.status;
  if (q.q) where.publicId = {contains: q.q.toUpperCase()};
  const rows = await repo.listOrders(prisma, where, q.limit ?? 50);
  const ids = rows.map(r => r.id);
  const [customers, payments, items, refunds] = await Promise.all([
    repo.customersByIds(prisma, [...new Set(rows.map(r => r.customerId))]), repo.paymentsByOrderIds(prisma, ids), repo.itemCounts(prisma, ids), repo.refundsByOrderIds(prisma, ids)
  ]);
  return rows.map(o => {
    const latestPayment = payments.filter(p => p.orderId === o.id).at(-1);
    const refundOpen = refunds.some(r => r.orderId === o.id && !TERMINAL_REFUND_STATUSES.includes(r.status));
    return {
      id: o.id, publicId: o.publicId, status: o.status, version: o.version, createdAt: o.createdAt.toISOString(), paidAt: o.paidAt?.toISOString() ?? null,
      subtotalPaise: o.subtotalPaise.toString(), discountPaise: o.discountPaise.toString(), shippingPaise: o.shippingPaise.toString(), taxPaise: o.taxPaise.toString(), totalPaise: o.totalPaise.toString(),
      customerEmail: customers.find(c => c.id === o.customerId)?.email ?? null,
      itemCount: items.find(i => i.orderId === o.id)?._sum.quantity ?? 0, paymentStatus: latestPayment?.status ?? null,
      shipWindow: shipWindow(o.shippingPromise), allowedTransitions: [...ORDER_TRANSITIONS[o.status]],
      refundOpen, canRequestRefund: canRequestRefund(o.status) && !refundOpen
    };
  });
}

export async function advanceOrder(staff: StaffIdentity, orderId: string, input: AdvanceOrderInput) {
  return prisma.$transaction(async tx => {
    const order = await repo.findOrder(tx, orderId);
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    if (input.expectedVersion !== undefined && input.expectedVersion !== order.version) throw new ApiError(409, "STALE_ORDER", "The order changed since you loaded it. Refresh and retry.");
    if (!canAdvance(order.status, input.to)) {
      throw new ApiError(409, "INVALID_TRANSITION", `Cannot move ${order.status} to ${input.to}.`, {from: order.status, to: input.to, allowed: ORDER_TRANSITIONS[order.status]});
    }
    if ((await repo.updateOrderGuarded(tx, order, input.to)) !== 1) throw new ApiError(409, "STALE_ORDER", "The order changed while saving. Refresh and retry.");
    await writeAudit(tx, staff, "ORDER_STATUS_CHANGED", order.id, {publicId: order.publicId, from: order.status, to: input.to, reason: input.reason, version: order.version + 1});
    return {orderId: order.id, publicId: order.publicId, status: input.to, version: order.version + 1};
  });
}

/**
 * Records a FULL refund request for finance. Creates Refund(PENDING_APPROVAL) and moves the order to REFUND_PENDING atomically.
 * No payment-provider call is made: RazorpayAdapter.refund() is intentionally unimplemented, so nothing is reported as refunded.
 */
export async function requestRefund(staff: StaffIdentity, orderId: string, input: RefundRequestInput) {
  return prisma.$transaction(async tx => {
    const order = await repo.findOrder(tx, orderId);
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    if (input.expectedVersion !== undefined && input.expectedVersion !== order.version) throw new ApiError(409, "STALE_ORDER", "The order changed since you loaded it. Refresh and retry.");
    if (!canRequestRefund(order.status)) throw new ApiError(409, "REFUND_NOT_ELIGIBLE", `A refund cannot be requested while the order is ${order.status}.`);
    const payment = await repo.capturedPayment(tx, order.id);
    if (!payment) throw new ApiError(409, "NO_CAPTURED_PAYMENT", "No captured payment exists for this order; there is nothing to refund.");
    if ((await repo.refundsForOrder(tx, order.id)).some(r => !TERMINAL_REFUND_STATUSES.includes(r.status))) throw new ApiError(409, "REFUND_ALREADY_REQUESTED", "An open refund already exists for this order.");
    const refund = await repo.createRefund(tx, {orderId: order.id, paymentId: payment.id, amountPaise: payment.amountPaise, reason: input.reason, status: "PENDING_APPROVAL"});
    if ((await repo.updateOrderGuarded(tx, order, "REFUND_PENDING")) !== 1) throw new ApiError(409, "STALE_ORDER", "The order changed while saving. Refresh and retry.");
    await writeAudit(tx, staff, "ORDER_STATUS_CHANGED", order.id, {publicId: order.publicId, from: order.status, to: "REFUND_PENDING", reason: input.reason, version: order.version + 1});
    await writeAudit(tx, staff, "REFUND_REQUESTED", order.id, {publicId: order.publicId, refundId: refund.id, amountPaise: payment.amountPaise.toString(), reason: input.reason, liveRefund: "NOT_ATTEMPTED"});
    return {
      orderId: order.id, status: "REFUND_PENDING" as const, version: order.version + 1,
      refund: {id: refund.id, status: refund.status, amountPaise: refund.amountPaise.toString()},
      liveRefund: "NOT_ATTEMPTED" as const,
      message: "Refund recorded as PENDING_APPROVAL. No money has moved; execution through the payment provider is not available in this release."
    };
  });
}
