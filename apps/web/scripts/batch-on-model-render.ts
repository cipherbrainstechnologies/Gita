/**
 * Batch register on-model raster media for concept SKUs (default 20, then 100, then full catalogue).
 * Idempotent via content fingerprint + ProductMediaV2 upsert.
 *
 * Usage:
 *   npx tsx scripts/batch-on-model-render.ts --limit=20
 *   npx tsx scripts/batch-on-model-render.ts --limit=100 --offset=0
 */
import {disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {buildDesignDna} from "../src/lib/fashion/design-dna";
import {registerOnModelMedia} from "../src/lib/fashion/on-model-media";
import {renderOnModelRaster} from "../src/lib/fashion/render-on-model-raster";
import type {SkuVisualInput} from "../src/lib/fashion/register-sku-visual";
import {uniqueModelIdsUsed} from "../src/lib/fashion/model-identities";
import {prisma} from "../src/lib/db";

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const offsetArg = process.argv.find((a) => a.startsWith("--offset="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 20) : 20;
const offset = offsetArg ? Math.max(0, Number(offsetArg.split("=")[1]) || 0) : 0;
const dryRun = process.argv.includes("--dry-run");
const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
const batchSize = batchArg ? Math.min(50, Math.max(1, Number(batchArg.split("=")[1]) || 10)) : 10;

installScriptDbShutdown();

async function main() {
  const products = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    orderBy: {slug: "asc"},
    skip: offset,
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

  const modelIds: string[] = [];
  let registered = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    for (const p of batch) {
      const meta = p.conceptMeta as Record<string, unknown> | null;
      const existing = await prisma.productMediaV2.findFirst({
        where: {productId: p.id, visualKind: "ON_MODEL_RASTER", mediaRole: "FRONT", storefrontVisible: true},
      });
      if (existing?.contentSha256) {
        skipped++;
        const om = (meta?.onModelGeneration as {modelIdentityId?: string} | undefined)?.modelIdentityId;
        if (om) modelIds.push(om);
        continue;
      }

      const dna = buildDesignDna({
        slug: p.slug,
        designBriefFingerprint: p.designBriefFingerprint!,
        quoteFingerprint:
          typeof meta?.quoteFingerprint === "string" ? meta.quoteFingerprint : p.designBriefFingerprint!,
        quoteText: p.tagline ?? p.slug,
        language: p.language,
        garmentFamily: p.garmentFamily,
        placement: typeof meta?.placement === "string" ? meta.placement : undefined,
        motif: typeof meta?.motif === "string" ? meta.motif : undefined,
        palette: p.palette,
      });
      modelIds.push(dna.modelIdentityId);

      if (dryRun) {
        registered++;
        continue;
      }

      const contentShaByView: Record<string, string> = {};
      for (const view of ["front", "back", "detail", "lifestyle"] as const) {
        const r = await renderOnModelRaster(dna, view);
        contentShaByView[view] = r.sha256;
      }

      await registerOnModelMedia(prisma, p as SkuVisualInput, contentShaByView);
      registered++;
    }
    await pause(80);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        offset,
        limit,
        processed: products.length,
        registered,
        skipped,
        uniqueModelIdentitiesInBatch: uniqueModelIdsUsed(modelIds),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());