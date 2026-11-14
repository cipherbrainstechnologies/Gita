/**
 * Registers deterministic per-SKU typographic garment previews (not shared photographs).
 */
import {createHash} from "node:crypto";
import {buildDesignDna, visualApiPath} from "../src/lib/fashion/design-dna";
import {contentSha256FromSvg, renderFlatMockupSvg} from "../src/lib/fashion/flat-mockup-svg";
import {prisma} from "../src/lib/db";

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 1000) : 5000;
const skipExisting = !process.argv.includes("--force");

type View = "front" | "back" | "detail";
const GALLERY: {view: View; mediaRole: string}[] = [
  {view: "front", mediaRole: "FRONT"},
  {view: "back", mediaRole: "BACK"},
  {view: "detail", mediaRole: "PRINT_CLOSEUP"},
];

function assetKey(slug: string, role: string, contentSha: string) {
  return createHash("sha256").update(`${slug}:${role}:${contentSha}`, "utf8").digest("hex");
}

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
    },
  });

  const contentHashes = new Map<string, string>();
  let registered = 0;
  let skipped = 0;
  let duplicateWarnings = 0;

  for (const p of products) {
    if (!p.tagline || !p.designBriefFingerprint) {
      skipped++;
      continue;
    }
    const meta = p.conceptMeta as Record<string, unknown> | null;
    const dna = buildDesignDna({
      slug: p.slug,
      designBriefFingerprint: p.designBriefFingerprint,
      quoteFingerprint:
        typeof meta?.quoteFingerprint === "string" ? meta.quoteFingerprint : p.designBriefFingerprint,
      quoteText: p.tagline,
      language: p.language,
      garmentFamily: p.garmentFamily,
      placement: typeof meta?.placement === "string" ? meta.placement : undefined,
      motif: typeof meta?.motif === "string" ? meta.motif : undefined,
      fit: typeof meta?.fit === "string" ? meta.fit : undefined,
      palette: p.palette,
    });

    if (skipExisting) {
      const hasStorefront = await prisma.productMediaV2.count({
        where: {productId: p.id, storefrontVisible: true, visualKind: "TYPOGRAPHIC_FLAT"},
      });
      if (hasStorefront >= 2) {
        skipped++;
        continue;
      }
    }

    const imagesJson: {src: string; view: string; alt: string; origin: string; approved: boolean; role: string}[] = [];

    for (const g of GALLERY) {
      const svg = renderFlatMockupSvg(dna, g.view);
      const contentSha256 = contentSha256FromSvg(svg);
      const dupSlug = contentHashes.get(contentSha256);
      if (dupSlug && dupSlug !== p.slug) duplicateWarnings++;

      contentHashes.set(contentSha256, p.slug);
      const fileUrl = visualApiPath(p.slug, g.view);
      const assetSha256 = assetKey(p.slug, g.mediaRole, contentSha256);

      if (!dryRun) {
        await prisma.productMediaV2.upsert({
          where: {productId_mediaRole_assetSha256: {productId: p.id, mediaRole: g.mediaRole, assetSha256}},
          create: {
            productId: p.id,
            mediaRole: g.mediaRole,
            fileUrl,
            origin: "TYPOGRAPHIC_PREVIEW",
            assetSha256,
            contentSha256,
            visualKind: "TYPOGRAPHIC_FLAT",
            storefrontVisible: true,
            approvedForPublication: false,
            reviewState: "PENDING",
            duplicateOfProductId: dupSlug && dupSlug !== p.slug ? undefined : undefined,
          },
          update: {
            fileUrl,
            contentSha256,
            visualKind: "TYPOGRAPHIC_FLAT",
            storefrontVisible: true,
            approvedForPublication: false,
            reviewState: "PENDING",
          },
        });
      }

      imagesJson.push({
        src: fileUrl,
        view: g.view,
        alt: `${p.slug} ${g.view} design preview — ${p.tagline.slice(0, 60)}`,
        origin: "TYPOGRAPHIC_PREVIEW",
        approved: false,
        role: g.mediaRole,
      });
    }

    if (!dryRun) {
      await prisma.product.update({
        where: {id: p.id},
        data: {
          conceptMeta: {...(meta ?? {}), designDna: dna, visualVersion: "typographic-flat-v1"},
          images: imagesJson,
          disclosure:
            "Product-specific typographic garment preview generated from this SKU’s Design DNA. On-model photography requires separate human approval.",
        },
      });
    }
    registered++;
  }

  const distinctContent = contentHashes.size;
  console.log(
    JSON.stringify(
      {
        dryRun,
        processed: products.length,
        registered,
        skipped,
        distinctContentHashes: distinctContent,
        duplicateContentWarnings: duplicateWarnings,
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
  .finally(() => prisma.$disconnect());