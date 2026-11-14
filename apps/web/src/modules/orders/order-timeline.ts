/** Pure order-status presentation logic. No I/O; unit-tested. */
export const TIMELINE_STATUSES = [
  "DRAFT", "PAYMENT_PENDING", "PAID", "VENDOR_CONFIRMED", "IN_PRODUCTION", "QUALITY_CONTROL", "READY_TO_DISPATCH", "SHIPPED", "DELIVERED"
] as const;
export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];

const LABELS: Record<string, string> = {
  DRAFT: "Order created", PAYMENT_PENDING: "Awaiting payment", PAID: "Payment verified", VENDOR_CONFIRMED: "Manufacturer confirmed",
  IN_PRODUCTION: "In production", QUALITY_CONTROL: "Quality check", READY_TO_DISPATCH: "Ready to dispatch", SHIPPED: "Shipped", DELIVERED: "Delivered",
  CANCEL_REQUESTED: "Cancellation requested", CANCELLED: "Cancelled", REFUND_PENDING: "Refund pending", REFUNDED: "Refunded", EXCEPTION: "Needs attention"
};
export const statusLabel = (s: string): string => LABELS[s] ?? s.replace(/_/g, " ").toLowerCase();

export type TimelineStep = {key: TimelineStatus; label: string; state: "done" | "current" | "upcoming"};
export type Timeline = {steps: TimelineStep[]; /** Set when the order left the happy path (cancel/refund/exception). */ offPath: {status: string; label: string} | null};

/**
 * Happy-path statuses map onto the nine-step timeline. Off-path statuses (cancel/refund/exception) keep the steps
 * the order verifiably reached (DRAFT always; through PAID only if `paidAt` is set) and surface the status separately.
 */
export function buildTimeline(status: string, paidAt?: string | null): Timeline {
  const idx = TIMELINE_STATUSES.indexOf(status as TimelineStatus);
  const onPath = idx >= 0;
  const reached = onPath ? idx : paidAt ? TIMELINE_STATUSES.indexOf("PAID") : 0;
  const state = (i: number): TimelineStep["state"] => {
    if (!onPath) return i <= reached ? "done" : "upcoming";
    if (i < idx) return "done";
    if (i === idx) return TIMELINE_STATUSES[i] === "DELIVERED" ? "done" : "current";
    return "upcoming";
  };
  const steps = TIMELINE_STATUSES.map((key, i): TimelineStep => ({key, label: LABELS[key], state: state(i)}));
  return {steps, offPath: onPath ? null : {status, label: statusLabel(status)}};
}
