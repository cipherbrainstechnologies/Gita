import {disconnectDb, installScriptDbShutdown} from "../src/lib/db-lifecycle";
import {prisma} from "../src/lib/db";

installScriptDbShutdown();

async function main() {
  const [total, fp, pants, tees, pre, ready, media] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({where: {designBriefFingerprint: {not: null}}}),
    prisma.product.count({where: {garmentFamily: "PANTS"}}),
    prisma.product.count({where: {garmentFamily: "TEES"}}),
    prisma.product.count({where: {status: "PREORDER"}}),
    prisma.product.count({where: {displaySaleReady: true}}),
    prisma.productMediaV2.count({where: {storefrontVisible: true}}),
  ]);
  console.log(JSON.stringify({total, withFingerprint: fp, pants, tees, preorder: pre, displaySaleReady: ready, visibleMedia: media}, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
