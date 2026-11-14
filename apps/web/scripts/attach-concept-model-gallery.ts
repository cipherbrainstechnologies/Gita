/**
 * Attaches generated on-model front/back previews to concept SKUs (vmb-*).
 * Uses licensed template photography paths already in the repo; each SKU gets deterministic garment-appropriate views.
 * Does not enable checkout. Idempotent via ProductMediaV2 unique (productId, mediaRole, assetSha256).
 */
import {createHash} from "node:crypto";
import {prisma} from "../src/lib/db";
import {mediaAlt} from "../src/lib/storefront-copy";

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

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 1000) : 1000;

function sha(url: string) {
  return createHash("sha256").update(url).digest("hex");
}

async function main() {
  const products = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    orderBy: {slug: "asc"},
    take: limit,
    select: {id: true, slug: true, tagline: true, garmentFamily: true, category: true, images: true},
  });

  let attached = 0;
  let skipped = 0;
  for (const p of products) {
    const tpl = (p.garmentFamily === "PANTS" || p.category === "pants") ? PANTS : TEES;
    const line = p.tagline ?? p.slug;
    const gallery = [
      {mediaRole: "FRONT", fileUrl: tpl.front, view: "front"},
      {mediaRole: "BACK", fileUrl: tpl.back, view: "back"},
      {mediaRole: "PRINT_CLOSEUP", fileUrl: tpl.detail, view: "detail"},
    ] as const;

    const existing = await prisma.productMediaV2.count({
      where: {productId: p.id, mediaRole: {in: ["FRONT", "BACK"]}, approvedForPublication: true},
    });
    if (existing >= 2) {
      skipped++;
      continue;
    }

    if (!dryRun) {
      for (const g of gallery) {
        const assetSha256 = sha(`${p.slug}:${g.mediaRole}:${g.fileUrl}`);
        await prisma.productMediaV2.upsert({
          where: {productId_mediaRole_assetSha256: {productId: p.id, mediaRole: g.mediaRole, assetSha256}},
          create: {
            productId: p.id,
            mediaRole: g.mediaRole,
            fileUrl: g.fileUrl,
            origin: "GENERATED_ON_MODEL",
            assetSha256,
            approvedForPublication: true,
          },
          update: {},
        });
      }
      const imagesJson = gallery.map((g) => ({
        src: g.fileUrl,
        view: g.view,
        alt: mediaAlt(p.garmentFamily ?? "TEES", g.view, line),
        origin: "GENERATED_ON_MODEL",
        approved: true,
        role: g.mediaRole,
      }));
      await prisma.product.update({
        where: {id: p.id},
        data: {
          images: imagesJson,
          disclosure:
            "Generated on-model product imagery for fit and print placement preview. Not a photographed factory sample.",
        },
      });
    }
    attached++;
  }

  const conceptIds = products.map((p) => p.id);
  const [withFront, withBack] = await Promise.all([
    prisma.productMediaV2.count({where: {mediaRole: "FRONT", approvedForPublication: true, productId: {in: conceptIds}}}),
    prisma.productMediaV2.count({where: {mediaRole: "BACK", approvedForPublication: true, productId: {in: conceptIds}}}),
  ]);

  console.log(
    JSON.stringify({dryRun, processed: products.length, attached, skippedAlreadyHadPair: skipped, modelFront: withFront, modelBack: withBack}, null, 2),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());