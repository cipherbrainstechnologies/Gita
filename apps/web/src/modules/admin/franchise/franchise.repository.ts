import type {Prisma} from "@prisma/client";
import type {Db} from "../shared/audit";

export const listStores = (db: Db) => db.store.findMany({orderBy: [{storeType: "asc"}, {createdAt: "asc"}], take: 200});
export const stockTotals = (db: Db) => db.physicalStock.groupBy({by: ["storeId"], _sum: {onHand: true, reserved: true}, _count: {_all: true}});
export const agreementCounts = (db: Db) => db.franchiseAgreement.groupBy({by: ["storeId"], _count: {_all: true}});
export const createStore = (db: Db, data: Prisma.StoreCreateInput) => db.store.create({data});
