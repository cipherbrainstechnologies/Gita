/**
 * Writes apps/web/docs/qa/FASHION_RELAUNCH_BASELINE.md with commit SHA and catalog counts.
 */
import {execSync} from "node:child_process";
import {writeFileSync, mkdirSync} from "node:fs";
import {resolve} from "node:path";

async function main() {
  const head = execSync("git rev-parse HEAD", {encoding: "utf8"}).trim();
  let counts = {total: 0, displaySaleReady: 0, withMedia: 0, tees: 0, pants: 0, preorder: 0};
  if (process.env.DATABASE_URL) {
    const {prisma} = await import("../src/lib/db");
    const [total, displaySaleReady, preorder, tees, pants, mediaRows] = await Promise.all([
      prisma.product.count({where: {status: {not: "ARCHIVED"}}}),
      prisma.product.count({where: {displaySaleReady: true}}),
      prisma.product.count({where: {status: "PREORDER"}}),
      prisma.product.count({where: {category: "tees"}}),
      prisma.product.count({where: {category: "pants"}}),
      prisma.productMediaV2.count({where: {storefrontVisible: true, approvedForPublication: true}}),
    ]);
    counts = {total, displaySaleReady, preorder, tees, pants, withMedia: mediaRows};
    await prisma.$disconnect();
  }

  const md = `# Fashion relaunch baseline

- **Git HEAD:** \`${head}\`
- **Generated:** ${new Date().toISOString()}
- **Production URL (expected):** https://web-production-b2b81db7.up.railway.app/shop

## Catalog counts (Prisma)

| Metric | Value |
|--------|------:|
| Active products | ${counts.total} |
| displaySaleReady | ${counts.displaySaleReady} |
| Approved storefront media rows | ${counts.withMedia} |
| Tees | ${counts.tees} |
| Pants | ${counts.pants} |
| PREORDER status | ${counts.preorder} |

## P0 gaps tracked

1. Licensed on-model pants photography (waist-to-ankle) — flat-lay / composite until commissioned.
2. Medusa catalog read requires \`gita_*\` metadata + Prisma enrichment (adapter shipped in fashion relaunch branch).
3. Payment/checkout remains \`ENABLE_CHECKOUT=false\` until business gates — interest-only path on PDP.
4. Demo credentials must stay off in production (\`DEMO_AUTH\` unset).

## Verification commands

\`\`\`bash
cd apps/web && npm run typecheck && npm run test && npm run build
\`\`\`
`;

  const out = resolve(process.cwd(), "docs/qa/FASHION_RELAUNCH_BASELINE.md");
  mkdirSync(resolve(process.cwd(), "docs/qa"), {recursive: true});
  writeFileSync(out, md);
  console.log(`Wrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});