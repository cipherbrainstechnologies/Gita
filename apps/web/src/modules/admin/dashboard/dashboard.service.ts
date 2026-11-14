import {prisma} from "@/lib/db";
import {withTimeout} from "@/lib/config";
import {PRODUCT_STATUS_ORDER, istDayStart} from "./dashboard.rules";

export type DashboardDto = {
  products: Record<(typeof PRODUCT_STATUS_ORDER)[number], number>;
  catalog: {conceptSkus: number; modelFrontApproved: number; modelBackApproved: number; preorderEligibleVariants: number};
  jobs: {queued: number; running: number};
  pendingApprovals: number;
  orders: {placedToday: number; paidToday: number; awaitingVendorConfirmation: number; refundPending: number};
  depositPolicy: {enabled: boolean; flatDepositInr: number; pauseCheckout: boolean} | null;
  since: string;
};

/** Live counts straight from PostgreSQL (3s budget). No cached or sample numbers; callers show an outage notice when this rejects. */
export async function loadDashboard(now = new Date()): Promise<DashboardDto> {
  const since = istDayStart(now);
  const conceptWhere = {designBriefFingerprint: {not: null}};
  const conceptIds = (await prisma.product.findMany({where: conceptWhere, select: {id: true}})).map((p) => p.id);
  const [byStatus, queued, running, pendingApprovals, placedToday, paidToday, awaiting, refundPending, conceptSkus, modelFront, modelBack, preorderEligible, depositPolicy] =
    await withTimeout(Promise.all([
    prisma.product.groupBy({by: ["status"], _count: {_all: true}}),
    prisma.jobRun.count({where: {status: "QUEUED"}}),
    prisma.jobRun.count({where: {status: "RUNNING"}}),
    prisma.designCandidate.count({where: {state: "NEEDS_HUMAN_REVIEW"}}),
    prisma.order.count({where: {createdAt: {gte: since}, status: {notIn: ["DRAFT"]}}}),
    prisma.order.count({where: {paidAt: {gte: since}}}),
    prisma.order.count({where: {status: "PAID"}}),
    prisma.order.count({where: {status: "REFUND_PENDING"}}),
    prisma.product.count({where: conceptWhere}),
    prisma.productMediaV2.count({where: {mediaRole: "FRONT", approvedForPublication: true, productId: {in: conceptIds}}}),
    prisma.productMediaV2.count({where: {mediaRole: "BACK", approvedForPublication: true, productId: {in: conceptIds}}}),
    prisma.productVariant.count({where: {enabled: true, product: {status: "PREORDER"}}}),
    prisma.depositPolicy.findUnique({where: {id: "default"}}),
  ]), 3000);
  const products = Object.fromEntries(PRODUCT_STATUS_ORDER.map(s => [s, byStatus.find(r => r.status === s)?._count._all ?? 0])) as DashboardDto["products"];
  return {
    products,
    catalog: {conceptSkus, modelFrontApproved: modelFront, modelBackApproved: modelBack, preorderEligibleVariants: preorderEligible},
    jobs: {queued, running},
    pendingApprovals,
    orders: {placedToday, paidToday, awaitingVendorConfirmation: awaiting, refundPending},
    depositPolicy: depositPolicy
      ? {enabled: depositPolicy.enabled, flatDepositInr: Number(depositPolicy.flatDepositPaise) / 100, pauseCheckout: depositPolicy.pauseDepositCheckout}
      : null,
    since: since.toISOString(),
  };
}

