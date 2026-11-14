import type {Prisma} from "@prisma/client";
import type {Db} from "../shared/audit";

export const listPromotions = (db: Db) => db.promotion.findMany({orderBy: [{endsAt: "desc"}, {code: "asc"}], take: 300});
export const redemptionCounts = (db: Db, ids: string[]) =>
  ids.length ? db.promotionRedemption.groupBy({by: ["promotionId"], where: {promotionId: {in: ids}}, _count: {_all: true}}) : Promise.resolve([]);
export const findPromotion = (db: Db, id: string) => db.promotion.findUnique({where: {id}});
export const redemptionCount = (db: Db, promotionId: string) => db.promotionRedemption.count({where: {promotionId}});
export const createPromotion = (db: Db, data: Prisma.PromotionCreateInput) => db.promotion.create({data});
export const updatePromotion = (db: Db, id: string, data: Prisma.PromotionUpdateInput) => db.promotion.update({where: {id}, data});
export const deletePromotion = (db: Db, id: string) => db.promotion.delete({where: {id}});
