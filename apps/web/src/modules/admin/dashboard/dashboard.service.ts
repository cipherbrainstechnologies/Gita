import {prisma} from "@/lib/db";
import {withTimeout} from "@/lib/config";
import {PRODUCT_STATUS_ORDER, istDayStart} from "./dashboard.rules";

export type DashboardDto = {
  products: Record<(typeof PRODUCT_STATUS_ORDER)[number], number>;
  jobs: {queued: number; running: number};
  pendingApprovals: number;
  orders: {placedToday: number; paidToday: number; awaitingVendorConfirmation: number; refundPending: number};
  since: string;
};

/** Live counts straight from PostgreSQL (3s budget). No cached or sample numbers; callers show an outage notice when this rejects. */
export async function loadDashboard(now = new Date()): Promise<DashboardDto> {
  const since = istDayStart(now);
  const [byStatus, queued, running, pendingApprovals, placedToday, paidToday, awaiting, refundPending] = await withTimeout(Promise.all([
    prisma.product.groupBy({by: ["status"], _count: {_all: true}}),
    prisma.jobRun.count({where: {status: "QUEUED"}}),
    prisma.jobRun.count({where: {status: "RUNNING"}}),
    prisma.designCandidate.count({where: {state: "NEEDS_HUMAN_REVIEW"}}),
    prisma.order.count({where: {createdAt: {gte: since}, status: {notIn: ["DRAFT"]}}}),
    prisma.order.count({where: {paidAt: {gte: since}}}),
    prisma.order.count({where: {status: "PAID"}}),
    prisma.order.count({where: {status: "REFUND_PENDING"}})
  ]), 3000);
  const products = Object.fromEntries(PRODUCT_STATUS_ORDER.map(s => [s, byStatus.find(r => r.status === s)?._count._all ?? 0])) as DashboardDto["products"];
  return {products, jobs: {queued, running}, pendingApprovals, orders: {placedToday, paidToday, awaitingVendorConfirmation: awaiting, refundPending}, since: since.toISOString()};
}

