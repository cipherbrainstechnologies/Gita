/**
 * Registers deterministic per-SKU typographic garment previews (not shared photographs).
 */
import {chunk, disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {registerSkuVisuals} from "../src/lib/fashion/register-sku-visual";
import {prisma} from "../src/lib/db";

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 1000) : 5000;
const skipExisting = !process.argv.includes("--force");
const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
const batchSize = batchArg ? Math.min(100, Math.max(5, Number(batchArg.split("=")[1]) || 25)) : 25;

installScriptDbShutdown();

async function main() {
  const products = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    orderBy: {slug: "asc"},
    take: limit,
    select: {
      id: true,
      slug: true,
      tagline: true,
      language: true,
      garmentFamily: true,
      category: true,
      designBriefFingerprint: true,
      conceptMeta: true,
      palette: true,
      displaySaleReady: true,
    },
  });

  const contentHashIndex = new Map<string, string>();
  let registered = 0;
  let skipped = 0;
  let duplicateWarnings = 0;

  const pending = skipExisting ? products.filter((p) => !p.displaySaleReady) : products;

  for (const batch of chunk(pending, batchSize)) {
    for (const p of batch) {
      if (dryRun) {
        registered++;
        continue;
      }
      const res = await registerSkuVisuals(prisma, p, contentHashIndex);
      if (!res) {
        skipped++;
        continue;
      }
      if (res.duplicateOf) duplicateWarnings++;
      registered++;
    }
    if (!dryRun) await pause(100);
  }

  if (skipExisting) skipped += products.length - pending.length;

  console.log(
    JSON.stringify(
      {
        dryRun,
        batchSize,
        processed: products.length,
        registered,
        skipped,
        distinctContentHashes: contentHashIndex.size,
        duplicateWarnings,
      },
      null,
      2,
    ),
  );
  if (duplicateWarnings > 0) process.exitCode = 2;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());