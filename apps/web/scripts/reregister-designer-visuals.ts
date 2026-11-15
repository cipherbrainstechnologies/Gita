/**
 * Re-registers storefront visuals as unique designer tee/track flat-lays with mindset prints.
 * Hides shared on-model composites.
 *
 * Local:  npx tsx scripts/reregister-designer-visuals.ts --limit=60 --force
 * Railway: railway ssh --service web -- npx tsx scripts/reregister-designer-visuals.ts --limit=120 --force
 */
import {chunk, disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {registerOnModelMedia} from "../src/lib/fashion/on-model-media";
import {RENDERER_VERSION, renderOnModelRaster} from "../src/lib/fashion/render-on-model-raster";
import {buildDesignDna} from "../src/lib/fashion/design-dna";
import {persistSkuWebp} from "../src/lib/fashion/persist-sku-asset";
import {prisma} from "../src/lib/db";
import type {OnModelView} from "../src/lib/fashion/on-model-types";

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.min(2000, Number(limitArg.split("=")[1]) || 120) : 120;
const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
const batchSize = batchArg ? Math.min(40, Math.max(5, Number(batchArg.split("=")[1]) || 15)) : 15;

installScriptDbShutdown();

const VIEWS: OnModelView[] = ["front", "back", "detail", "lifestyle"];

async function main() {
  const products = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}, tagline: {not: null}},
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

  let registered = 0;
  let failed = 0;

  for (const batch of chunk(products, batchSize)) {
    for (const p of batch) {
      if (!p.tagline || !p.designBriefFingerprint) continue;
      if (dryRun) {
        registered++;
        continue;
      }
      try {
        const meta = p.conceptMeta as Record<string, unknown> | null;
        const dna = buildDesignDna({
          slug: p.slug,
          designBriefFingerprint: p.designBriefFingerprint,
          quoteFingerprint:
            typeof meta?.quoteFingerprint === "string"
              ? meta.quoteFingerprint
              : p.designBriefFingerprint,
          quoteText: p.tagline,
          language: p.language,
          garmentFamily: p.garmentFamily,
          placement: typeof meta?.placement === "string" ? meta.placement : undefined,
          motif: typeof meta?.motif === "string" ? meta.motif : undefined,
          fit: typeof meta?.fit === "string" ? meta.fit : undefined,
          palette: p.palette,
        });

        const contentShaByView: Partial<Record<OnModelView, string>> = {};
        const fileUrlOverrides: Partial<Record<OnModelView, string>> = {};
        for (const view of VIEWS) {
          const frame = await renderOnModelRaster(dna, view);
          contentShaByView[view] = frame.sha256;
          const persisted = await persistSkuWebp(p.slug, view, frame.bytes, frame.sha256);
          fileUrlOverrides[view] = persisted.fileUrl;
        }

        await registerOnModelMedia(prisma, p, contentShaByView, {
          rendererVersion: RENDERER_VERSION,
          generationSource: dna.garmentFamily === "PANTS" ? "PANTS_FLATLAY" : "TEE_FLATLAY",
          presentation: "FLATLAY",
          visualKind: dna.garmentFamily === "PANTS" ? "PANTS_FLATLAY_PREVIEW" : "TEE_FLATLAY_PREVIEW",
          fileUrlOverrides,
        });
        registered++;
      } catch (e) {
        failed++;
        console.error(JSON.stringify({slug: p.slug, error: e instanceof Error ? e.message : String(e)}));
      }
    }
    await pause(80);
  }

  console.log(
    JSON.stringify(
      {
        rendererVersion: RENDERER_VERSION,
        dryRun,
        limit,
        candidates: products.length,
        registered,
        failed,
        usp: "DESIGNER_GARMENT_WITH_MINDSET_PRINT",
      },
      null,
      2,
    ),
  );
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
