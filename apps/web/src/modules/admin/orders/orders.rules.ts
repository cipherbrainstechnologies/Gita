/** Pure order-lifecycle rules (no I/O, safe for client components). */
export type OrderStatus =
  | "DRAFT" | "RESERVATION_PENDING" | "PAYMENT_PENDING" | "DEPOSIT_PAID" | "BALANCE_PENDING" | "PAID"
  | "VENDOR_CONFIRMED" | "IN_PRODUCTION" | "QUALITY_CONTROL" | "READY_TO_DISPATCH"
  | "SHIPPED" | "DELIVERED" | "CANCEL_REQUESTED" | "CANCELLED" | "REFUND_PENDING" | "REFUNDED" | "EXCEPTION";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "DRAFT", "RESERVATION_PENDING", "PAYMENT_PENDING", "DEPOSIT_PAID", "BALANCE_PENDING", "PAID", "VENDOR_CONFIRMED",
  "IN_PRODUCTION", "QUALITY_CONTROL", "READY_TO_DISPATCH", "SHIPPED", "DELIVERED", "CANCEL_REQUESTED", "CANCELLED",
  "REFUND_PENDING", "REFUNDED", "EXCEPTION",
];

/**
 * Staff-driven moves. PAID itself is only ever set by the verified payment webhook (never here), and REFUND_PENDING is only
 * reachable through the refund action so a Refund row always exists with it. REFUNDED/CANCELLED are reserved for provider-confirmed flows.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: [],
  RESERVATION_PENDING: [],
  PAYMENT_PENDING: [],
  DEPOSIT_PAID: ["BALANCE_PENDING", "EXCEPTION"],
  BALANCE_PENDING: [],
  PAID: ["VENDOR_CONFIRMED", "EXCEPTION"],
  VENDOR_CONFIRMED: ["IN_PRODUCTION", "EXCEPTION"],
  IN_PRODUCTION: ["QUALITY_CONTROL", "EXCEPTION"],
  QUALITY_CONTROL: ["READY_TO_DISPATCH", "EXCEPTION"],
  READY_TO_DISPATCH: ["SHIPPED", "EXCEPTION"],
  SHIPPED: ["DELIVERED", "EXCEPTION"],
  DELIVERED: [],
  CANCEL_REQUESTED: ["EXCEPTION"],
  EXCEPTION: ["PAID", "VENDOR_CONFIRMED", "IN_PRODUCTION", "QUALITY_CONTROL", "READY_TO_DISPATCH"],
  CANCELLED: [],
  REFUND_PENDING: [],
  REFUNDED: []
};
export const canAdvance = (from: OrderStatus, to: OrderStatus): boolean => ORDER_TRANSITIONS[from].includes(to);

/** Only orders with a captured payment can have a refund requested. */
export const REFUND_ELIGIBLE: readonly OrderStatus[] = [
  "DEPOSIT_PAID", "PAID", "VENDOR_CONFIRMED", "IN_PRODUCTION", "QUALITY_CONTROL", "READY_TO_DISPATCH", "SHIPPED",
  "DELIVERED", "CANCEL_REQUESTED", "EXCEPTION",
];
export const canRequestRefund = (status: OrderStatus): boolean => REFUND_ELIGIBLE.includes(status);

/** Refund rows in these states no longer block a new request. */
export const TERMINAL_REFUND_STATUSES: readonly string[] = ["REJECTED", "FAILED"];
