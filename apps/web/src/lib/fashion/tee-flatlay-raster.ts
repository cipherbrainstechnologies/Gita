import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {renderArtworkPng} from "./artwork-raster";
import {FRAME, printBox} from "./garment-placements";
import type {OnModelView} from "./on-model-types";
import {hexToRgb} from "./color-utils";
import {CATALOG_FONT, svgFontFaceCss} from "./svg-font";

export function colourLuminance(hex: string): number {
  const {r, g, b} = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

/** True when DNA colour is near-neutral black/charcoal (matches in-repo editorial tees). */
export function matchesBlackEditorialTee(colourHex: string): boolean {
  const {r, g, b} = hexToRgb(colourHex);
  const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return lum < 0.22 && chroma < 45;
}

/** Colour-accurate tee flat-lay when on-model photo colour cannot match DNA colourway. */
export async function renderTeeFlatlay(
  dna: DesignDna,
  view: OnModelView,
): Promise<{bytes: Buffer; sha256: string; mimeType: "image/webp"}> {
  const {width: W, height: H} = FRAME;
  const fabric = dna.colourHex;
  const bgHue = 40 + (dna.renderSeed % 8);
  const label =
    view === "back" ? "BACK · FLAT-LAY" : view === "detail" ? "DETAIL · PRINT" : "FRONT · FLAT-LAY";

  // Adult tee with sleeves — waist-length silhouette
  const body = `
    M 310 260
    L 200 300
    L 90 470
    L 170 520
    L 210 560
    L 230 1180
    Q 540 1240 850 1180
    L 870 560
    L 910 520
    L 990 470
    L 880 300
    L 770 260
    Q 540 210 310 260
    Z`;
  const neckOuter = `M 430 250 Q 540 200 650 250 L 620 290 Q 540 260 460 290 Z`;
  const neckInner = `M 470 255 Q 540 225 610 255 Q 540 275 470 255 Z`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style type="text/css"><![CDATA[${svgFontFaceCss()}]]></style>
    <linearGradient id="teeShade" x1="0.2" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="45%" stop-color="${fabric}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.28"/>
    </linearGradient>
    <filter id="teeShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="hsl(${bgHue} 22% 93%)"/>
  <text x="48" y="64" font-family="${CATALOG_FONT}" font-size="20" font-weight="700" fill="#1a1a1a">${escapeXml(dna.conceptId)}</text>
  <text x="48" y="94" font-family="${CATALOG_FONT}" font-size="15" fill="#60635d">${escapeXml(dna.garmentCut)} · ${escapeXml(dna.colourwayId)} · ${label}</text>
  <g filter="url(#teeShadow)">
    <path d="${body}" fill="url(#teeShade)" stroke="#111" stroke-opacity="0.22" stroke-width="2"/>
    <path d="${neckOuter}" fill="${fabric}" stroke="#111" stroke-opacity="0.15"/>
    <path d="${neckInner}" fill="hsl(${bgHue} 22% 93%)"/>
  </g>
  <text x="${W - 48}" y="${H - 36}" text-anchor="end" font-family="${CATALOG_FONT}" font-size="14" fill="#64748b">Digital garment preview · tee flat-lay · colour-matched · not a factory sample</text>
</svg>`;

  let composed = await sharp(Buffer.from(svg)).png().toBuffer();
  if (view === "front" || view === "back" || view === "detail") {
    const art = await renderArtworkPng(dna);
    const box = printBox(dna, view === "detail" ? "front" : view);
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
  return {bytes, sha256: createHash("sha256").update(bytes).digest("hex"), mimeType: "image/webp"};
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
