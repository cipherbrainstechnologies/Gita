import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {renderArtworkPng} from "./artwork-raster";
import {recolourGarment} from "./fabric-recolor";
import {FRAME, garmentMaskSvg, printBox} from "./garment-placements";
import {getModelIdentity} from "./model-identities";

export type OnModelView = "front" | "back" | "detail" | "lifestyle";

export const RENDERER_VERSION = "cpu-garment-mask-v2";

function publicPath(urlPath: string, cwd = process.cwd()): string {
  const rel = urlPath.replace(/^\//, "");
  return join(cwd, "public", rel);
}

async function maskBuffer(dna: DesignDna, view: OnModelView): Promise<Buffer> {
  const svg =
    view === "detail"
      ? garmentMaskSvg(dna, "front")
      : view === "lifestyle"
        ? garmentMaskSvg(dna, "front")
        : garmentMaskSvg(dna, view);
  return sharp(Buffer.from(svg)).resize(FRAME.width, FRAME.height).png().toBuffer();
}

/** Free CPU compositor — garment-masked recolour + deterministic print; not GPU VTON. */
export async function renderOnModelRaster(
  dna: DesignDna,
  view: OnModelView,
): Promise<{
  bytes: Buffer;
  sha256: string;
  mimeType: "image/webp";
  modelIdentityId: string;
  rendererVersion: string;
}> {
  const model = getModelIdentity(dna.modelIdentityId);
  const flip = dna.renderSeed % 5 === 0;
  const asset =
    view === "back"
      ? model.backAsset
      : view === "lifestyle" && model.lifestyleAsset
        ? model.lifestyleAsset
        : view === "detail"
          ? "/images/quiet-power-editorial-detail.webp"
          : model.frontAsset;

  const basePath = publicPath(asset);
  let photo = sharp(await readFile(basePath)).rotate().resize(FRAME.width, FRAME.height, {
    fit: "cover",
    position: "centre",
  });
  if (flip) photo = photo.flop();

  const photoBuf = await photo
    .modulate({
      brightness: 0.96 + (dna.renderSeed % 4) * 0.01,
      saturation: 1.02,
    })
    .ensureAlpha()
    .toBuffer();

  const mask = await maskBuffer(dna, view);
  const recoloured = await recolourGarment(photoBuf, mask, dna.colourHex, dna.garmentFamily === "PANTS" ? 0.5 : 0.62);

  const shadowSvg = `<svg width="${FRAME.width}" height="${FRAME.height}">
    <ellipse cx="${FRAME.width / 2}" cy="${FRAME.height - 80}" rx="340" ry="36" fill="rgba(0,0,0,0.12)"/>
  </svg>`;

  let composed = await sharp(recoloured)
    .composite([{input: Buffer.from(shadowSvg), blend: "multiply"}])
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
  };
}

export function onModelApiPath(slug: string, view: OnModelView): string {
  return `/api/catalog/on-model/${encodeURIComponent(slug)}/${view}`;
}

export function staticOnModelPath(storageKey: string): string {
  return `/api/assets/generated/${storageKey}`;
}