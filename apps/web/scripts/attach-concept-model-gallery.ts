/**
 * @deprecated Shared template attach caused duplicate imagery across 1,000 SKUs.
 * Use: db:remediate:template-media + db:register:product-visuals-v2 (+ GPU queue for on-model).
 */
import {prisma} from "../src/lib/db";

const legacy = process.argv.includes("--legacy-simulation-only");
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!legacy) {
    console.error(
      JSON.stringify(
        {
          error: "BLOCKED",
          message:
            "attach-concept-model-gallery was disabled — it reused the same editorial photos for every SKU. Run npm run db:remediate:template-media then npm run db:register:product-visuals-v2 instead.",
          hint: "Pass --legacy-simulation-only only in isolated test environments.",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  console.warn("LEGACY MODE: still attaches shared templates — not for production.");
  const {createHash} = await import("node:crypto");
  const TEES = {
    front: "/images/quiet-power-editorial-front.webp",
    back: "/images/quiet-power-editorial-back.webp",
    detail: "/images/quiet-power-editorial-detail.webp",
  };
  const PANTS = {
    front: "/images/quiet-power-editorial-side.jpg",
    back: "/images/karma-editorial-back.webp",
    detail: "/images/quiet-power-editorial-detail.webp",
  };
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Math.min(100, Number(limitArg.split("=")[1]) || 10) : 10;
  const products = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    take: limit,
    select: {id: true, slug: true, garmentFamily: true, category: true},
  });
  let attached = 0;
  for (const p of products) {
    const tpl = p.garmentFamily === "PANTS" || p.category === "pants" ? PANTS : TEES;
    if (!dryRun) {
      for (const [role, url] of [
        ["FRONT", tpl.front],
        ["BACK", tpl.back],
      ] as const) {
        const assetSha256 = createHash("sha256").update(`${p.slug}:${role}:${url}`).digest("hex");
        await prisma.productMediaV2.upsert({
          where: {productId_mediaRole_assetSha256: {productId: p.id, mediaRole: role, assetSha256}},
          create: {
            productId: p.id,
            mediaRole: role,
            fileUrl: url,
            origin: "LEGACY_TEMPLATE_ATTACH",
            assetSha256,
            approvedForPublication: false,
            storefrontVisible: false,
            visualKind: "SHARED_TEMPLATE",
            reviewState: "REJECTED",
          },
          update: {},
        });
      }
    }
    attached++;
  }
  console.log(JSON.stringify({legacy: true, dryRun, attached, note: "approvedForPublication is never set in legacy mode"}, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());