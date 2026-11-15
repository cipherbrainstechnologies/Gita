import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {renderArtworkPng} from "./artwork-raster";
import {resolveGarmentPresentation} from "./garment-family-contract";
import {FRAME, printBox} from "./garment-placements";
import {getModelIdentity} from "./model-identities";
import {renderPantsFlatlay} from "./pants-flatlay-raster";
import {matchesBlackEditorialTee, renderTeeFlatlay} from "./tee-flatlay-raster";
import type {OnModelView} from "./on-model-types";

export type {OnModelView};

/** Bump forces batch re-render of previously published bad composites. */
export const RENDERER_VERSION = "cpu-garment-truth-v3";

function publicPath(urlPath: string, cwd = process.cwd()): string {
  const rel = urlPath.replace(/^\//, "");
  return join(cwd, "public", rel);
}

/** Free CPU compositor — garment-family truthful; pants never use tee photos. */
export async function renderOnModelRaster(
  dna: DesignDna,
  view: OnModelView,
): Promise<{
  bytes: Buffer;
  sha256: string;
  mimeType: "image/webp";
  modelIdentityId: string;
  rendererVersion: string;
  presentation: "ON_MODEL" | "FLATLAY";
  visualKind: string;
}> {
  const contract = resolveGarmentPresentation(dna);
  if (dna.garmentFamily === "PANTS" || contract.presentation === "FLATLAY") {
    const flat = await renderPantsFlatlay(dna, view);
    return {
      ...flat,
      modelIdentityId: dna.modelIdentityId,
      rendererVersion: RENDERER_VERSION,
      presentation: "FLATLAY",
      visualKind: "PANTS_FLATLAY_PREVIEW",
    };
  }

  // Black editorial photos only match dark colourways; otherwise colour-accurate tee flat-lay.
  if (!matchesBlackEditorialTee(dna.colourHex)) {
    const flat = await renderTeeFlatlay(dna, view);
    return {
      ...flat,
      modelIdentityId: dna.modelIdentityId,
      rendererVersion: RENDERER_VERSION,
      presentation: "FLATLAY",
      visualKind: "TEE_FLATLAY_PREVIEW",
    };
  }

  const model = getModelIdentity(dna.modelIdentityId);
  if (!model.garmentFamilies.includes("TEES")) {
    throw new Error(`INCOMPATIBLE_MODEL:${model.id}:TEES`);
  }

  const asset =
    view === "back"
      ? model.backAsset
      : view === "lifestyle" && model.lifestyleAsset
        ? model.lifestyleAsset
        : view === "detail"
          ? "/images/quiet-power-editorial-detail.webp"
          : model.frontAsset;

  // Hard reject if somehow a non-tee path slipped in
  const gate = resolveGarmentPresentation(dna, asset);
  if (!gate.ok && gate.code === "TEE_PHOTO_FOR_PANTS") {
    const flat = await renderPantsFlatlay(dna, view);
    return {
      ...flat,
      modelIdentityId: dna.modelIdentityId,
      rendererVersion: RENDERER_VERSION,
      presentation: "FLATLAY",
      visualKind: "PANTS_FLATLAY_PREVIEW",
    };
  }

  const basePath = publicPath(asset);
  // Never flop — source editorials contain printed logos that would mirror.
  // Never broad-mask recolour — ellipse/polygon masks created purple/olive body patches.
  let composed = await sharp(await readFile(basePath))
    .rotate()
    .resize(FRAME.width, FRAME.height, {fit: "cover", position: "centre"})
    .modulate({
      brightness: 0.99 + (dna.renderSeed % 2) * 0.01,
      saturation: 1.0,
    })
    .ensureAlpha()
    .toBuffer();

  if (view === "front" || view === "back") {
    const art = await renderArtworkPng(dna);
    const box = printBox(dna, view);
    if (box) {
      const artSized = await sharp(art.bytes)
        .resize(box.width, box.height, {fit: "inside"})
        .png()
        .toBuffer();
      composed = await sharp(composed)
        .composite([{input: artSized, left: box.left, top: box.top, blend: "over"}])
        .toBuffer();
    }
  }

  const bytes = await sharp(composed).webp({quality: 90, effort: 4}).toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {
    bytes,
    sha256,
    mimeType: "image/webp",
    modelIdentityId: model.id,
    rendererVersion: RENDERER_VERSION,
    presentation: "ON_MODEL",
    visualKind: "ON_MODEL_CPU_COMPOSITE",
  };
}

export function onModelApiPath(slug: string, view: OnModelView): string {
  return `/api/catalog/on-model/${encodeURIComponent(slug)}/${view}`;
}

export function staticOnModelPath(storageKey: string): string {
  return `/api/assets/generated/${storageKey}`;
}
