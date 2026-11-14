import type {OrderStatus, Prisma} from "@prisma/client";
import type {Db} from "../shared/audit";

export const listOrders = (db: Db, where: Prisma.OrderWhereInput, take: number) =>
  db.order.findMany({where, orderBy: {createdAt: "desc"}, take});

export const customersByIds = (db: Db, ids: string[]) =>
  ids.length ? db.customer.findMany({where: {id: {in: ids}}, select: {id: true, email: true}}) : Promise.resolve([]);

export const paymentsByOrderIds = (db: Db, ids: string[]) =>
  ids.length ? db.payment.findMany({where: {orderId: {in: ids}}, select: {orderId: true, status: true, createdAt: true}, orderBy: {createdAt: "asc"}}) : Promise.resolve([]);

export const itemCounts = (db: Db, ids: string[]) =>
  ids.length ? db.orderLine.groupBy({by: ["orderId"], where: {orderId: {in: ids}}, _sum: {quantity: true}}) : Promise.resolve([]);

export const refundsByOrderIds = (db: Db, ids: string[]) =>
  ids.length ? db.refund.findMany({where: {orderId: {in: ids}}, select: {orderId: true, status: true}}) : Promise.resolve([]);

export const findOrder = (db: Db, id: string) => db.order.findUnique({where: {id}});

/** Optimistic lock on (status, version): two staff clicking at once cannot both win. Returns affected rows. */
export const updateOrderGuarded = async (db: Db, o: {id: string; status: OrderStatus; version: number}, to: OrderStatus) =>
  (await db.order.updateMany({where: {id: o.id, status: o.status, version: o.version}, data: {status: to, version: {increment: 1}}})).count;

export const capturedPayment = (db: Db, orderId: string) =>
  db.payment.findFirst({where: {orderId, status: "CAPTURED"}, orderBy: {capturedAt: "desc"}});

export const refundsForOrder = (db: Db, orderId: string) => db.refund.findMany({where: {orderId}, select: {id: true, status: true}});

export const createRefund = (db: Db, data: Prisma.RefundUncheckedCreateInput) => db.refund.create({data});
