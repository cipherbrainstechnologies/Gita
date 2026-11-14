import {prisma} from "@/lib/db";

/** Data access only. Never selects `addressEncrypted`, `auditTrace` or vendor-side fields: they must not reach customer surfaces. */
export async function findCustomerByEmail(email: string) {
  return prisma.customer.findUnique({where: {email}, select: {id: true, email: true, displayName: true, createdAt: true}});
}

export async function findOrdersByCustomer(customerId: string, take: number) {
  const orders = await prisma.order.findMany({
    where: {customerId}, orderBy: {createdAt: "desc"}, take,
    select: {id: true, publicId: true, status: true, currency: true, subtotalPaise: true, discountPaise: true, shippingPaise: true, taxPaise: true, totalPaise: true, shippingPromise: true, paidAt: true, createdAt: true}
  });
  if (!orders.length) return {orders, lines: [], payments: []};
  const ids = orders.map(o => o.id);
  const [lines, payments] = await Promise.all([
    prisma.orderLine.findMany({where: {orderId: {in: ids}}, select: {orderId: true, description: true, skuSnapshot: true, quantity: true, unitPaise: true, attributes: true}, orderBy: {id: "asc"}}),
    prisma.payment.findMany({where: {orderId: {in: ids}}, select: {orderId: true, provider: true, status: true, amountPaise: true, capturedAt: true, createdAt: true}, orderBy: {createdAt: "desc"}})
  ]);
  return {orders, lines, payments};
}

export async function findWaitlistByEmail(email: string) {
  return prisma.waitlistLead.findMany({where: {email}, orderBy: {createdAt: "desc"}, take: 100, select: {productSlug: true, size: true, source: true, createdAt: true}});
}
