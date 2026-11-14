import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {getModelIdentity} from "./model-identities";
import {renderArtworkPng} from "./artwork-raster";

export type OnModelView = "front" | "back" | "detail" | "lifestyle";

function publicPath(urlPath: string, cwd = process.cwd()): string {
  const rel = urlPath.replace(/^\//, "");
  return join(cwd, "public", rel);
}

function hexToRgb(hex: string): {r: number; g: number; b: number} {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return {r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255};
}

/** Per-SKU raster on-model frame: licensed photo + colour-grade + deterministic print overlay. */
export async function renderOnModelRaster(
  dna: DesignDna,
  view: OnModelView,
): Promise<{bytes: Buffer; sha256: string; mimeType: "image/webp"; modelIdentityId: string}> {
  const model = getModelIdentity(dna.modelIdentityId);
  const flip = dna.renderSeed % 3 === 0;
  const asset =
    view === "back"
      ? model.backAsset
      : view === "lifestyle" && model.lifestyleAsset
        ? model.lifestyleAsset
        : view === "detail"
          ? "/images/quiet-power-editorial-detail.webp"
          : model.frontAsset;

  const basePath = publicPath(asset);
  let base = sharp(await readFile(basePath)).rotate().resize(1080, 1440, {fit: "cover", position: "centre"});
  if (flip) base = base.flop();
  const rgb = hexToRgb(dna.colourHex);
  const grade = await base
    .modulate({
      brightness: 0.92 + (dna.renderSeed % 7) * 0.02,
      saturation: 0.85 + (dna.renderSeed % 5) * 0.05,
      hue: (dna.renderSeed % 24) - 12,
    })
    .ensureAlpha()
    .toBuffer();

  const overlaySvg = `
<svg width="1080" height="1440">
  <rect x="200" y="${view === "back" ? "280" : "320"}" width="680" height="720" rx="40"
    fill="rgba(${rgb.r},${rgb.g},${rgb.b},0.38)"/>
</svg>`;

  let pipeline = sharp(grade).composite([{input: Buffer.from(overlaySvg), blend: "multiply"}]);

  if (view === "front" || view === "back") {
    const art = await renderArtworkPng(dna);
    const artResized = await sharp(art.bytes)
      .resize(520, 520, {fit: "inside"})
      .ensureAlpha()
      .linear(view === "back" ? [0.92, 0.92, 0.92, 1] : [0.88, 0.88, 0.88, 1])
      .png()
      .toBuffer();
    const top = view === "back" ? 360 : 400;
    pipeline = sharp(await pipeline.toBuffer()).composite([
      {input: artResized, top, left: Math.floor((1080 - 520) / 2), blend: "over"},
    ]);
  }

  const bytes = await pipeline.webp({quality: 88, effort: 4}).toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {bytes, sha256, mimeType: "image/webp", modelIdentityId: model.id};
}

export function onModelApiPath(slug: string, view: OnModelView): string {
  return `/api/catalog/on-model/${encodeURIComponent(slug)}/${view}`;
}