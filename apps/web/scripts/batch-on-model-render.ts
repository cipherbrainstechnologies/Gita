/**
 * Resumable zero-paid batch: CPU garment-mask compositor + optional self-hosted VTON + QA + persist.
 */
import {disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {buildDesignDna} from "../src/lib/fashion/design-dna";
import {registerOnModelMedia} from "../src/lib/fashion/on-model-media";
import {RENDERER_VERSION, renderOnModelRaster} from "../src/lib/fashion/render-on-model-raster";
import type {SkuVisualInput} from "../src/lib/fashion/register-sku-visual";
import {uniqueModelIdsUsed} from "../src/lib/fashion/model-identities";
import {assessOnModelFrame} from "../src/lib/fashion/visual-quality-gate";
import {persistSkuWebp} from "../src/lib/fashion/persist-sku-asset";
import {tryVtonOnModel} from "../src/lib/fashion/vton-on-model";
import {prisma} from "../src/lib/db";

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const offsetArg = process.argv.find((a) => a.startsWith("--offset="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 20) : 20;
const offset = offsetArg ? Math.max(0, Number(offsetArg.split("=")[1]) || 0) : 0;
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const persist = process.argv.includes("--persist");
const tryVton = process.argv.includes("--vton");
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
  let qaFailed = 0;
  let vtonSuccess = 0;
  let vtonSkipped = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    for (const p of batch) {
      const meta = p.conceptMeta as Record<string, unknown> | null;
      const ver = (meta?.onModelGeneration as {rendererVersion?: string} | undefined)?.rendererVersion;
      if (!force && ver === RENDERER_VERSION) {
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

      let usedVton = false;
      if (tryVton) {
        const vton = await tryVtonOnModel(dna, `vton:${p.slug}:front`, "front");
        if (vton.ok) {
          vtonSuccess++;
          usedVton = true;
        } else vtonSkipped++;
      }

      const contentShaByView: Record<string, string> = {};
      const fileUrlByView: Record<string, string> = {};

      for (const view of ["front", "back", "detail", "lifestyle"] as const) {
        const r = await renderOnModelRaster(dna, view);
        const qa = await assessOnModelFrame(r.bytes, dna, view);
        if (!qa.pass) {
          qaFailed++;
          continue;
        }
        contentShaByView[view] = r.sha256;
        if (persist) {
          const saved = await persistSkuWebp(p.slug, view, r.bytes, r.sha256);
          if (saved.persisted) fileUrlByView[view] = saved.fileUrl;
        }
      }

      if (!contentShaByView.front) continue;

      await registerOnModelMedia(prisma, p as SkuVisualInput, contentShaByView, {
        rendererVersion: RENDERER_VERSION,
        generationSource: usedVton ? "CPU_PLUS_VTON" : "CPU_COMPOSITE",
        fileUrlOverrides: fileUrlByView,
      });
      registered++;
    }
    await pause(60);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        force,
        persist,
        tryVton,
        rendererVersion: RENDERER_VERSION,
        offset,
        limit,
        processed: products.length,
        registered,
        skipped,
        qaFailed,
        vtonSuccess,
        vtonSkipped,
        uniqueModelIdentitiesInBatch: uniqueModelIdsUsed(modelIds),
        costInr: 0,
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