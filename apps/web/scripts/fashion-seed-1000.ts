/**
 * Fashion collection manifest wrapper around existing idempotent 1,000 brief import.
 * Usage: tsx scripts/fashion-seed-1000.ts [--dry-run] [--limit N] [--offset N]
 */
import {writeFileSync, mkdirSync} from "node:fs";
import {resolve} from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const offsetIdx = args.indexOf("--offset");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined;
const offset = offsetIdx >= 0 ? Number(args[offsetIdx + 1]) : 0;

async function main() {
  const report: Record<string, unknown> = {
    startedAt: new Date().toISOString(),
    dryRun,
    limit,
    offset,
    seedScript: "seed-1000-product-concepts.ts",
  };

  if (!dryRun) {
    process.env.FASHION_SEED_OFFSET = String(offset);
    if (limit != null) process.env.FASHION_SEED_LIMIT = String(limit);
    await import("./seed-1000-product-concepts");
  } else {
    report.note = "Dry run — no DB writes. Invoke without --dry-run to run seed-1000-product-concepts.";
  }

  if (process.env.DATABASE_URL && !dryRun) {
    const {prisma} = await import("../src/lib/db");
    const [total, displayReady, preorder] = await Promise.all([
      prisma.product.count({where: {status: {not: "ARCHIVED"}}}),
      prisma.product.count({where: {displaySaleReady: true}}),
      prisma.product.count({where: {status: "PREORDER"}}),
    ]);
    report.counts = {total, displaySaleReady: displayReady, preorder};
    await prisma.$disconnect();
  }

  report.finishedAt = new Date().toISOString();
  const outDir = resolve(process.cwd(), "data/generated");
  mkdirSync(outDir, {recursive: true});
  const manifestPath = resolve(outDir, "fashion-collection-manifest.json");
  writeFileSync(manifestPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Manifest written: ${manifestPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});