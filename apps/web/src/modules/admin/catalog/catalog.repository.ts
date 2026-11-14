import type {Prisma, ProductStatus} from "@prisma/client";
import type {Db} from "../shared/audit";

export const productWithVariants = {variants: {orderBy: {sku: "asc"}}} satisfies Prisma.ProductInclude;
export type ProductRow = Prisma.ProductGetPayload<{include: typeof productWithVariants}>;

export const listProducts = (db: Db): Promise<ProductRow[]> =>
  db.product.findMany({include: productWithVariants, orderBy: [{status: "asc"}, {createdAt: "asc"}], take: 500});

export const findProduct = (db: Db, id: string) => db.product.findUnique({where: {id}});
export const findProductWithVariants = (db: Db, id: string) => db.product.findUnique({where: {id}, include: productWithVariants});
export const findVariantBySku = (db: Db, sku: string) => db.productVariant.findUnique({where: {sku}, include: {product: {select: {id: true, status: true}}}});

export const capacitiesForVariants = (db: Db, variantIds: string[]) =>
  variantIds.length
    ? db.preorderCapacity.findMany({where: {variantId: {in: variantIds}}, select: {variantId: true, confirmed: true, capacity: true, reserved: true, shipWindowTo: true}})
    : Promise.resolve([]);

export const createProduct = (db: Db, data: Prisma.ProductCreateInput) => db.product.create({data});

/** Optimistic guard: only writes when the status is still what the caller validated against. Returns affected rows. */
export const updateProductGuarded = async (db: Db, id: string, expectedStatus: ProductStatus, data: Prisma.ProductUncheckedUpdateManyInput) =>
  (await db.product.updateMany({where: {id, status: expectedStatus}, data})).count;

export const disableVariantsOfProduct = (db: Db, productId: string) => db.productVariant.updateMany({where: {productId, enabled: true}, data: {enabled: false}});

export const createVariant = (db: Db, data: Prisma.ProductVariantUncheckedCreateInput) => db.productVariant.create({data});
export const updateVariant = (db: Db, id: string, data: Prisma.ProductVariantUncheckedUpdateInput) => db.productVariant.update({where: {id}, data});

export const priceHistoryCount = (db: Db, variantId: string) => db.priceHistory.count({where: {variantId}});
export const closeOpenPriceHistory = (db: Db, variantId: string, endAt: Date) => db.priceHistory.updateMany({where: {variantId, endAt: null}, data: {endAt}});
export const addPriceHistory = (db: Db, data: Prisma.PriceHistoryUncheckedCreateInput) => db.priceHistory.create({data});

