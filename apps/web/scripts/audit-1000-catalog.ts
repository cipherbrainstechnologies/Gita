/**
 * Verifies 1,000 concept products (and optionally media / payment readiness).
 * Usage: npx tsx scripts/audit-1000-catalog.ts [--catalog-only]
 */
import {prisma} from "../src/lib/db";

const catalogOnly = process.argv.includes("--catalog-only");

async function main() {
  const conceptWhere = {designBriefFingerprint: {not: null}};
  const conceptIds = (await prisma.product.findMany({where: conceptWhere, select: {id: true}})).map((p) => p.id);

  const [productCount, variantCount, fpGroups, approvedFront, approvedBack, preorderEnabled] = await Promise.all([
    prisma.product.count({where: conceptWhere}),
    prisma.productVariant.count({where: {product: conceptWhere}}),
    prisma.product.groupBy({by: ["designBriefFingerprint"], where: conceptWhere, _count: true}),
    prisma.productMediaV2.count({
      where: {mediaRole: "FRONT", approvedForPublication: true, productId: {in: conceptIds}},
    }),
    prisma.productMediaV2.count({
      where: {mediaRole: "BACK", approvedForPublication: true, productId: {in: conceptIds}},
    }),
    prisma.productVariant.count({
      where: {enabled: true, product: {status: "PREORDER", ...conceptWhere}},
    }),
  ]);

  const dupFps = fpGroups.filter((g) => g._count > 1).length;
  const report = {
    catalogOnly,
    conceptProducts: productCount,
    conceptVariants: variantCount,
    expectedProducts: 1000,
    expectedVariants: 6000,
    duplicateBriefFingerprints: dupFps,
    approvedFrontViews: approvedFront,
    approvedBackViews: approvedBack,
    paymentEligibleVariants: preorderEnabled,
    pass: productCount === 1000 && variantCount === 6000 && dupFps === 0,
  };

  console.log(JSON.stringify(report, null, 2));

  let ok = report.pass;
  if (!catalogOnly) {
    ok = ok && approvedFront >= 1000 && approvedBack >= 1000 && preorderEnabled > 0;
  }
  if (!ok) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());