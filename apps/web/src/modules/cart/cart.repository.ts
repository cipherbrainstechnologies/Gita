import {prisma} from "@/lib/db";

export const ensureCustomerId = async (email: string) =>
  (await prisma.customer.upsert({where: {email}, create: {email}, update: {}, select: {id: true}})).id;

export const findCustomerId = async (email: string) =>
  (await prisma.customer.findUnique({where: {email}, select: {id: true}}))?.id ?? null;

export const listItems = (customerId: string) =>
  prisma.cartItem.findMany({where: {customerId}, orderBy: {updatedAt: "desc"}, take: 50, select: {id: true, productSlug: true, size: true, quantity: true}});

export const countItems = (customerId: string) => prisma.cartItem.count({where: {customerId}});

export const findItem = (customerId: string, productSlug: string, size: string) =>
  prisma.cartItem.findUnique({where: {customerId_productSlug_size: {customerId, productSlug, size}}, select: {id: true, quantity: true}});

export const upsertItem = (customerId: string, productSlug: string, size: string, quantity: number) =>
  prisma.cartItem.upsert({
    where: {customerId_productSlug_size: {customerId, productSlug, size}},
    create: {customerId, productSlug, size, quantity}, update: {quantity}, select: {id: true, quantity: true}
  });

/** Scoped by customerId so one customer can never delete another's row. */
export const deleteItem = (customerId: string, id: string) => prisma.cartItem.deleteMany({where: {id, customerId}});
export const updateQuantity = (customerId: string, id: string, quantity: number) => prisma.cartItem.updateMany({where: {id, customerId}, data: {quantity}});
