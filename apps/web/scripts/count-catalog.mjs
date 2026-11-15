import {PrismaClient} from "@prisma/client";
const p = new PrismaClient();
const [total, fp, pants, tees, pre, ready] = await Promise.all([
  p.product.count(),
  p.product.count({where: {designBriefFingerprint: {not: null}}}),
  p.product.count({where: {garmentFamily: "PANTS"}}),
  p.product.count({where: {garmentFamily: "TEES"}}),
  p.product.count({where: {status: "PREORDER"}}),
  p.product.count({where: {displaySaleReady: true}}),
]);
console.log(JSON.stringify({total, withFingerprint: fp, pants, tees, preorder: pre, displaySaleReady: ready}, null, 2));
await p.$disconnect();
