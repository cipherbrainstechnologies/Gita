/**
 * Resumable idempotent batch: garment-truth compositor (tees) + pants flat-lay.
 * Flags: --dry-run --limit=N --offset=N --batch-size=N --force --force-version=X --persist --vton --resume
 */
import {disconnectDb, installScriptDbShutdown, pause} from "../src/lib/db-lifecycle";
import {buildDesignDna} from "../src/lib/fashion/design-dna";
import {registerOnModelMedia} from "../src/lib/fashion/on-model-media";
import {RENDERER_VERSION, renderOnModelRaster} from "../src/lib/fashion/render-on-model-raster";
import type {SkuVisualInput} from "../src/lib/fashion/register-sku-visual";
import {
  distinctSourcePhotosUsed,
  reportSourceDiversity,
  uniqueModelIdsUsed,
} from "../src/lib/fashion/model-identities";
import {assessOnModelFrame} from "../src/lib/fashion/visual-quality-gate";
import {persistSkuWebp} from "../src/lib/fashion/persist-sku-asset";
import {tryVtonOnModel} from "../src/lib/fashion/vton-on-model";
import {prisma} from "../src/lib/db";
import {mkdir, appendFile} from "node:fs/promises";
import {join} from "node:path";

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const offsetArg = process.argv.find((a) => a.startsWith("--offset="));
const limit = limitArg ? Math.min(5000, Number(limitArg.split("=")[1]) || 20) : 20;
const offset = offsetArg ? Math.max(0, Number(offsetArg.split("=")[1]) || 0) : 0;
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const persist = process.argv.includes("--persist");
const tryVton = process.argv.includes("--vton");
const resume = process.argv.includes("--resume");
const forceVersionArg = process.argv.find((a) => a.startsWith("--force-version="));
const forceVersion = forceVersionArg?.split("=")[1]?.trim() || null;
const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
const batchSize = batchArg ? Math.min(50, Math.max(1, Number(batchArg.split("=")[1]) || 10)) : 10;

installScriptDbShutdown();

async function main() {
  const logDir = join(process.cwd(), "docs/qa/apparel-batch-logs");
  await mkdir(logDir, {recursive: true});
  const logPath = join(logDir, `batch-${Date.now()}.jsonl`);

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
  let pantsFlatlay = 0;
  let teesOnModel = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    for (const p of batch) {
      const meta = p.conceptMeta as Record<string, unknown> | null;
      const ver = (meta?.onModelGeneration as {rendererVersion?: string} | undefined)?.rendererVersion;
      const alreadyCurrent = ver === RENDERER_VERSION;
      const forceThis = force || (forceVersion != null && ver === forceVersion);
      if (!forceThis && alreadyCurrent && resume) {
        skipped++;
        const om = (meta?.onModelGeneration as {modelIdentityId?: string} | undefined)?.modelIdentityId;
        if (om) modelIds.push(om);
        await appendFile(
          logPath,
          JSON.stringify({slug: p.slug, status: "skipped_resume", ver}) + "\n",
        );
        continue;
      }
      if (!forceThis && alreadyCurrent) {
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
        await appendFile(
          logPath,
          JSON.stringify({
            slug: p.slug,
            status: "dry_run",
            garmentFamily: dna.garmentFamily,
            colourwayId: dna.colourwayId,
          }) + "\n",
        );
        continue;
      }

      let usedVton = false;
      if (tryVton && dna.garmentFamily === "TEES") {
        const vton = await tryVtonOnModel(dna, `vton:${p.slug}:front`, "front");
        if (vton.ok) {
          vtonSuccess++;
          usedVton = true;
        } else vtonSkipped++;
      }

      const contentShaByView: Record<string, string> = {};
      const fileUrlByView: Record<string, string> = {};
      let presentation: "ON_MODEL" | "FLATLAY" = "ON_MODEL";
      let visualKind = "ON_MODEL_CPU_COMPOSITE";

      for (const view of ["front", "back", "detail", "lifestyle"] as const) {
        const r = await renderOnModelRaster(dna, view);
        presentation = r.presentation;
        visualKind = r.visualKind;
        const qa = await assessOnModelFrame(r.bytes, dna, view, {
          presentation: r.presentation,
          visualKind: r.visualKind,
        });
        if (!qa.pass) {
          qaFailed++;
          await appendFile(
            logPath,
            JSON.stringify({slug: p.slug, view, status: "qa_fail", code: qa.code, detail: qa.detail}) +
              "\n",
          );
          continue;
        }
        contentShaByView[view] = r.sha256;
        if (persist) {
          const saved = await persistSkuWebp(p.slug, view, r.bytes, r.sha256);
          if (saved.persisted) fileUrlByView[view] = saved.fileUrl;
        }
      }

      if (!contentShaByView.front) {
        await appendFile(logPath, JSON.stringify({slug: p.slug, status: "no_front"}) + "\n");
        continue;
      }

      await registerOnModelMedia(prisma, p as SkuVisualInput, contentShaByView, {
        rendererVersion: RENDERER_VERSION,
        generationSource: usedVton
          ? "CPU_PLUS_VTON"
          : visualKind === "PANTS_FLATLAY_PREVIEW"
            ? "PANTS_FLATLAY"
            : visualKind === "TEE_FLATLAY_PREVIEW"
              ? "TEE_FLATLAY"
              : "CPU_COMPOSITE",
        fileUrlOverrides: fileUrlByView,
        visualKind,
        presentation,
      });
      registered++;
      if (presentation === "FLATLAY") pantsFlatlay++;
      else teesOnModel++;
      await appendFile(
        logPath,
        JSON.stringify({
          slug: p.slug,
          status: "registered",
          presentation,
          visualKind,
          garmentFamily: dna.garmentFamily,
          colourHex: dna.colourHex,
        }) + "\n",
      );
    }
    await pause(60);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        force,
        forceVersion,
        resume,
        persist,
        tryVton,
        rendererVersion: RENDERER_VERSION,
        offset,
        limit,
        processed: products.length,
        registered,
        skipped,
        qaFailed,
        pantsFlatlay,
        teesOnModel,
        vtonSuccess,
        vtonSkipped,
        uniqueModelIdentitiesInBatch: uniqueModelIdsUsed(modelIds),
        distinctSourcePhotosInBatch: distinctSourcePhotosUsed(modelIds),
        sourceLibrary: reportSourceDiversity(),
        logPath,
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
