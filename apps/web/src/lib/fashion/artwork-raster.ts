import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";

function escapeSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapLines(text: string, max = 22): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

/**
 * Transparent RGBA print artwork — ink/motif pixels only.
 * Never draws an opaque background rectangle (that caused solid colour squares on PDPs).
 */
export async function renderArtworkPng(dna: DesignDna): Promise<{bytes: Buffer; sha256: string}> {
  const w = 800;
  const h = 800;
  const lines = wrapLines(dna.quoteText);
  const tspans = lines
    .map(
      (t, i) =>
        `<tspan x="400" dy="${i === 0 ? 0 : 44}">${escapeSvg(t)}</tspan>`,
    )
    .join("");
  const ink = dna.accentHex;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <text text-anchor="middle" x="400" y="340" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" fill="${ink}" stroke="rgba(0,0,0,0.35)" stroke-width="2" paint-order="stroke">${tspans}</text>
</svg>`;
  const bytes = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .png({compressionLevel: 9})
    .toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {bytes, sha256};
}
