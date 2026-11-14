/**
 * Unapproves shared template photography incorrectly attached to concept SKUs.
 */
import {disconnectDb, installScriptDbShutdown} from "../src/lib/db-lifecycle";
import {prisma} from "../src/lib/db";

installScriptDbShutdown();
import {SHARED_TEMPLATE_URLS, isSharedTemplateUrl} from "../src/lib/fashion/template-urls";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const conceptProducts = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    select: {id: true},
  });
  const conceptIds = conceptProducts.map((p) => p.id);
  const templateList = [...SHARED_TEMPLATE_URLS];

  const rows = await prisma.productMediaV2.findMany({
    where: {
      productId: {in: conceptIds},
      OR: [{fileUrl: {in: templateList}}, {origin: "GENERATED_ON_MODEL", approvedForPublication: true}],
    },
  });

  let remediated = 0;
  for (const row of rows) {
    if (!isSharedTemplateUrl(row.fileUrl) && row.origin !== "GENERATED_ON_MODEL") continue;
    if (!dryRun) {
      await prisma.productMediaV2.update({
        where: {id: row.id},
        data: {
          approvedForPublication: false,
          storefrontVisible: false,
          visualKind: "SHARED_TEMPLATE_INVALIDATED",
          reviewState: "REQUIRES_REGENERATION",
          origin: row.origin === "GENERATED_ON_MODEL" ? "LEGACY_TEMPLATE_ATTACH" : row.origin,
        },
      });
    }
    remediated++;
  }

  if (!dryRun) {
    await prisma.product.updateMany({
      where: {id: {in: conceptIds}},
      data: {
        disclosure:
          "Concept SKU — product-specific design preview or human-reviewed on-model imagery only. Shared template photos are not sold as this garment.",
      },
    });
  }

  console.log(JSON.stringify({dryRun, conceptProducts: conceptIds.length, rowsScanned: rows.length, remediated}, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());