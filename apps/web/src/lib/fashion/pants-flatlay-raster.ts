import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {renderArtworkPng} from "./artwork-raster";
import {FRAME, printBox} from "./garment-placements";
import type {OnModelView} from "./on-model-types";

/**
 * Waist-to-ankle track-pant flat-lay preview.
 * Single continuous garment silhouette (not disconnected polygons).
 */
export async function renderPantsFlatlay(
  dna: DesignDna,
  view: OnModelView,
): Promise<{bytes: Buffer; sha256: string; mimeType: "image/webp"}> {
  const {width: W, height: H} = FRAME;
  const fabric = dna.colourHex;
  const accent = dna.accentHex;
  const seed = dna.renderSeed;
  const cuff = dna.garmentCut.includes("CUFF") || dna.garmentCut.includes("JOGGER");
  const wide = dna.garmentCut.includes("WIDE") || dna.garmentCut.includes("BAGGY");
  const stripe = dna.garmentCut.includes("STRIPE") || seed % 3 === 0;

  const waistTop = 150;
  const waistBot = 210;
  const rise = 480;
  const hem = H - 100;
  const outer = wide ? 175 : 210;
  const innerGap = wide ? 38 : 28;
  const ankleW = cuff ? 95 : wide ? 130 : 110;

  // Continuous outline: left outer → left ankle → crotch rise → right ankle → right outer → waist
  const garment = `
    M ${outer} ${waistTop}
    L ${W - outer} ${waistTop}
    L ${W - outer + 8} ${waistBot}
    L ${W - outer + 20} ${rise}
    L ${W / 2 + ankleW} ${hem}
    L ${W / 2 + innerGap} ${hem}
    L ${W / 2 + 12} ${rise + 40}
    L ${W / 2 - 12} ${rise + 40}
    L ${W / 2 - innerGap} ${hem}
    L ${W / 2 - ankleW} ${hem}
    L ${outer - 20} ${rise}
    L ${outer - 8} ${waistBot}
    Z`;

  const waistband = `
    M ${outer - 6} ${waistTop - 8}
    L ${W - outer + 6} ${waistTop - 8}
    L ${W - outer + 10} ${waistBot}
    L ${outer - 10} ${waistBot}
    Z`;

  const stripeLeft = stripe
    ? `<path d="M ${outer + 36} ${waistBot + 20} L ${W / 2 - ankleW + 18} ${hem - 16}" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity="0.65"/>`
    : "";
  const stripeRight = stripe
    ? `<path d="M ${W - outer - 36} ${waistBot + 20} L ${W / 2 + ankleW - 18} ${hem - 16}" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity="0.65"/>`
    : "";

  const cuffLeft = cuff
    ? `<path d="M ${W / 2 - ankleW - 8} ${hem - 36} L ${W / 2 - innerGap + 4} ${hem - 36} L ${W / 2 - innerGap} ${hem} L ${W / 2 - ankleW} ${hem} Z" fill="${fabric}" stroke="#000" stroke-opacity="0.2"/>`
    : "";
  const cuffRight = cuff
    ? `<path d="M ${W / 2 + innerGap - 4} ${hem - 36} L ${W / 2 + ankleW + 8} ${hem - 36} L ${W / 2 + ankleW} ${hem} L ${W / 2 + innerGap} ${hem} Z" fill="${fabric}" stroke="#000" stroke-opacity="0.2"/>`
    : "";

  const bgHue = 36 + (seed % 10);
  const label =
    view === "back" ? "BACK · FLAT-LAY" : view === "detail" ? "DETAIL · PRINT" : "FRONT · FLAT-LAY";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="pantShade" x1="0.15" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="35%" stop-color="${fabric}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </linearGradient>
    <filter id="softShadow" x="-25%" y="-10%" width="150%" height="130%">
      <feDropShadow dx="0" dy="22" stdDeviation="26" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="hsl(${bgHue} 24% 94%)"/>
  <text x="48" y="64" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#1a1a1a">${escapeXml(dna.conceptId)}</text>
  <text x="48" y="92" font-family="system-ui,sans-serif" font-size="14" fill="#60635d">${escapeXml(dna.garmentCut)} · ${escapeXml(dna.colourwayId)} · ${label}</text>
  <g filter="url(#softShadow)">
    <path d="${garment}" fill="url(#pantShade)" stroke="#111" stroke-opacity="0.22" stroke-width="2"/>
    <path d="${waistband}" fill="${fabric}" stroke="#111" stroke-opacity="0.18" stroke-width="1.5" opacity="0.95"/>
  </g>
  <ellipse cx="${W / 2}" cy="${(waistTop + waistBot) / 2}" rx="16" ry="9" fill="none" stroke="${accent}" stroke-width="3" opacity="0.75"/>
  <path d="M ${W / 2 - 48} ${(waistTop + waistBot) / 2 + 4} Q ${W / 2} ${waistBot + 28} ${W / 2 + 48} ${(waistTop + waistBot) / 2 + 4}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.55"/>
  <path d="M ${outer + 50} ${waistBot + 30} Q ${outer + 90} ${rise - 40} ${outer + 70} ${rise + 20}" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>
  <path d="M ${W - outer - 50} ${waistBot + 30} Q ${W - outer - 90} ${rise - 40} ${W - outer - 70} ${rise + 20}" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>
  ${stripeLeft}${stripeRight}${cuffLeft}${cuffRight}
  <text x="${W - 48}" y="${H - 36}" text-anchor="end" font-size="13" fill="#64748b">Digital garment preview · track pant flat-lay · not a factory sample</text>
</svg>`;

  let composed = await sharp(Buffer.from(svg)).png().toBuffer();

  if (view === "front" || view === "back" || view === "detail") {
    const art = await renderArtworkPng(dna);
    const box = printBox(dna, view === "detail" ? "front" : view);
    if (box) {
      const artSized = await sharp(art.bytes)
        .resize(box.width, Math.max(48, Math.floor(box.height * 0.85)), {fit: "inside"})
        .png()
        .toBuffer();
      composed = await sharp(composed)
        .composite([{input: artSized, left: box.left, top: box.top, blend: "over"}])
        .toBuffer();
    }
  }

  const bytes = await sharp(composed).webp({quality: 90, effort: 4}).toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {bytes, sha256, mimeType: "image/webp"};
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
