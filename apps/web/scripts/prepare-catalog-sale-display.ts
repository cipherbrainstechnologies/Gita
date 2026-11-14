/**
 * One-shot, idempotent production job: remediate template dupes → register unique SKU visuals → audit.
 * Batched to avoid overwhelming Postgres (reduces "connection reset by peer" from abrupt client disconnects).
 *
 * Usage: npx tsx scripts/prepare-catalog-sale-display.ts [--dry-run] [--limit=1000] [--batch-size=25]
 */
import {execSync} from "node:child_process";
import {chunk, disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {registerSkuVisuals} from "../src/lib/fashion/register-sku-visual";
import {prisma} from "../src/lib/db";

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 1000) : 1000;
const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
const batchSize = batchArg ? Math.min(100, Math.max(5, Number(batchArg.split("=")[1]) || 25)) : 25;
const skipRemediate = process.argv.includes("--skip-remediate");

installScriptDbShutdown();

async function loadReadyIds(): Promise<Set<string>> {
  const rows = await prisma.productMediaV2.groupBy({
    by: ["productId", "mediaRole"],
    where: {
      storefrontVisible: true,
      visualKind: "TYPOGRAPHIC_FLAT",
      mediaRole: {in: ["FRONT", "BACK"]},
    },
    _count: true,
  });
  const front = new Set(rows.filter((r) => r.mediaRole === "FRONT").map((r) => r.productId));
  const back = new Set(rows.filter((r) => r.mediaRole === "BACK").map((r) => r.productId));
  const both = new Set<string>();
  for (const id of front) if (back.has(id)) both.add(id);
  return both;
}

async function registerBatch() {
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

  const ready = await loadReadyIds();
  const contentHashIndex = new Map<string, string>();
  let registered = 0;
  let skipped = 0;
  let duplicateWarnings = 0;

  const pending = products.filter((p) => !ready.has(p.id) || !p.displaySaleReady);
  for (const batch of chunk(pending, batchSize)) {
    if (dryRun) {
      registered += batch.length;
      continue;
    }
    for (const p of batch) {
      const res = await registerSkuVisuals(prisma, p, contentHashIndex);
      if (!res) {
        skipped++;
        continue;
      }
      if (res.duplicateOf) duplicateWarnings++;
      registered++;
    }
    await pause(150);
  }

  skipped += products.length - pending.length;

  return {processed: products.length, registered, skipped, distinctContentHashes: contentHashIndex.size, duplicateWarnings};
}

async function main() {
  if (!dryRun && !skipRemediate) {
    execSync("npx tsx scripts/remediate-template-media.ts", {stdio: "inherit", cwd: process.cwd()});
  }

  const pass1 = await registerBatch();
  const pass2 = dryRun ? {...pass1, registered: 0, skipped: pass1.processed} : await registerBatch();
  const pass2Idempotent = pass2.registered === 0;

  const [saleReady, variantCount] = await Promise.all([
    prisma.product.count({where: {designBriefFingerprint: {not: null}, displaySaleReady: true}}),
    prisma.productVariant.count({where: {product: {designBriefFingerprint: {not: null}}}}),
  ]);

  const report = {
    dryRun,
    batchSize,
    pass1,
    pass2Idempotent,
    displaySaleReadyProducts: saleReady,
    conceptVariants: variantCount,
    paymentNote: "ENABLE_CHECKOUT remains off unless ops enables PREORDER variants + legal gates",
  };

  console.log(JSON.stringify(report, null, 2));
  if (!dryRun && duplicateWarningsFrom(pass1, pass2)) process.exitCode = 2;
  if (!pass2Idempotent && !dryRun) process.exitCode = 1;
}

function duplicateWarningsFrom(...parts: {duplicateWarnings: number}[]) {
  return parts.some((p) => p.duplicateWarnings > 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());