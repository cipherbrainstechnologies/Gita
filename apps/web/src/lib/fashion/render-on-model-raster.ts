import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
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

/** Photoreal editorial tees (colour-matched) + designer flat-lays elsewhere. */
export const RENDERER_VERSION = "cpu-photoreal-hybrid-v6";

function publicPath(urlPath: string, cwd = process.cwd()): string {
  return join(cwd, "public", urlPath.replace(/^\//, ""));
}

/**
 * - PANTS: waist-to-ankle flat-lay (no licensed bottoms photography yet)
 * - TEES near-black: photoreal licensed editorial on-model + transparent print
 * - TEES other colours: colour-accurate tee flat-lay (not a black tee lied as coloured)
 */
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
  void resolveGarmentPresentation(dna);

  if (dna.garmentFamily === "PANTS") {
    const flat = await renderPantsFlatlay(dna, view);
    return {
      ...flat,
      modelIdentityId: dna.modelIdentityId,
      rendererVersion: RENDERER_VERSION,
      presentation: "FLATLAY",
      visualKind: "PANTS_FLATLAY_PREVIEW",
    };
  }

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
  const asset =
    view === "back"
      ? model.backAsset
      : view === "lifestyle" && model.lifestyleAsset
        ? model.lifestyleAsset
        : view === "detail"
          ? "/images/quiet-power-editorial-detail.webp"
          : model.frontAsset;

  let composed = await sharp(await readFile(publicPath(asset)))
    .rotate()
    .resize(FRAME.width, FRAME.height, {fit: "cover", position: "centre"})
    .modulate({brightness: 0.99, saturation: 1.0})
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
  return {
    bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
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
