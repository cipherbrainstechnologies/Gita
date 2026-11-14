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

/** Deterministic print artwork PNG (typography exact — not model-generated text). */
export async function renderArtworkPng(dna: DesignDna): Promise<{bytes: Buffer; sha256: string}> {
  const w = 800;
  const h = 800;
  const lines = wrapLines(dna.quoteText);
  const tspans = lines
    .map(
      (t, i) =>
        `<tspan x="400" dy="${i === 0 ? 0 : 42}">${escapeSvg(t)}</tspan>`,
    )
    .join("");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${dna.colourHex}"/>
  <text text-anchor="middle" x="400" y="360" font-family="Georgia, serif" font-size="32" fill="${dna.accentHex}">${tspans}</text>
  <text x="400" y="720" text-anchor="middle" font-size="14" fill="${dna.accentHex}" opacity="0.6">${escapeSvg(dna.placement)} · ${escapeSvg(dna.artStyle)}</text>
</svg>`;
  const bytes = await sharp(Buffer.from(svg)).png().toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {bytes, sha256};
}