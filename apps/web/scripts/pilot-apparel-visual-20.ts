/**
 * Pilot: render 10 tees + 10 pants locally, write before/after contact sheet evidence.
 */
import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {buildDesignDna} from "../src/lib/fashion/design-dna";
import {renderOnModelRaster, RENDERER_VERSION} from "../src/lib/fashion/render-on-model-raster";
import {assessOnModelFrame} from "../src/lib/fashion/visual-quality-gate";
import {reportSourceDiversity} from "../src/lib/fashion/model-identities";

const PANTS = [
  "vmb-1000",
  "vmb-0998",
  "vmb-0996",
  "vmb-0994",
  "vmb-0992",
  "vmb-0990",
  "vmb-0988",
  "vmb-0986",
  "vmb-0984",
  "vmb-0982",
];
const TEES = [
  "vmb-0999",
  "vmb-0997",
  "vmb-0995",
  "vmb-0993",
  "vmb-0991",
  "vmb-0989",
  "vmb-0987",
  "vmb-0985",
  "vmb-0983",
  "vmb-0981",
];

async function renderOne(slug: string, family: "TEES" | "PANTS", outDir: string) {
  const dna = buildDesignDna({
    slug,
    designBriefFingerprint: `pilot-${slug}`,
    quoteFingerprint: `q-${slug}`,
    quoteText:
      family === "PANTS"
        ? "Keep the story moving with grounded ambition."
        : "Today is enough for build quietly.",
    garmentFamily: family,
  });
  const frame = await renderOnModelRaster(dna, "front");
  const qa = await assessOnModelFrame(frame.bytes, dna, "front", {
    presentation: frame.presentation,
    visualKind: frame.visualKind,
  });
  const path = join(outDir, `after-${slug}-front.webp`);
  await writeFile(path, frame.bytes);
  return {
    slug,
    family,
    presentation: frame.presentation,
    visualKind: frame.visualKind,
    colourwayId: dna.colourwayId,
    colourHex: dna.colourHex,
    sha256: frame.sha256,
    qaPass: qa.pass,
    qaCode: qa.pass ? null : qa.code,
    path,
  };
}

async function main() {
  const outDir = join(process.cwd(), "docs/qa/apparel-visual-baseline");
  await mkdir(outDir, {recursive: true});
  const results = [];
  for (const slug of PANTS) results.push(await renderOne(slug, "PANTS", outDir));
  for (const slug of TEES) results.push(await renderOne(slug, "TEES", outDir));

  const summary = {
    rendererVersion: RENDERER_VERSION,
    sourceLibrary: reportSourceDiversity(),
    pantsOk: results.filter(
      (r) =>
        r.family === "PANTS" &&
        r.presentation === "FLATLAY" &&
        r.visualKind === "PANTS_FLATLAY_PREVIEW" &&
        r.qaPass,
    ).length,
    teesOk: results.filter(
      (r) =>
        r.family === "TEES" &&
        (r.visualKind === "ON_MODEL_CPU_COMPOSITE" || r.visualKind === "TEE_FLATLAY_PREVIEW") &&
        r.qaPass,
    ).length,
    results,
  };
  await writeFile(join(outDir, "pilot-20-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (summary.pantsOk < 10 || summary.teesOk < 10) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
