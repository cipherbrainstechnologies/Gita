/**
 * Export Gita Prisma products as JSON for Medusa shadow import (dry-run safe).
 * Usage: npx tsx scripts/medusa-shadow-catalog-export.ts > /tmp/gita-catalog-shadow.json
 */
import {prisma} from "../src/lib/db";

async function main() {
  const rows = await prisma.product.findMany({
    where: {status: {not: "ARCHIVED"}},
    select: {id: true, slug: true, title: true, status: true},
    orderBy: {slug: "asc"},
    take: 5000,
  });
  const payload = rows.map((r) => ({
    sourceId: r.id,
    gitaSlug: r.slug,
    title: r.title,
    publicationState:
      r.status === "PREORDER" ? "preorder" : r.status === "CONCEPT" ? "concept" : "draft",
  }));
  process.stdout.write(JSON.stringify(payload));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());