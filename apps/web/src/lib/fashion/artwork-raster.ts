import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {CATALOG_FONT, svgFontFaceCss} from "./svg-font";

function escapeSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapLines(text: string, max = 18): string[] {
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
  return lines.slice(0, 5);
}

/**
 * Transparent RGBA print artwork — mindset / verse as the hero.
 * No opaque background plate (that caused solid colour squares on cards).
 */
export async function renderArtworkPng(dna: DesignDna): Promise<{bytes: Buffer; sha256: string}> {
  const w = 900;
  const h = 900;
  const ink = dna.accentHex;
  const style = dna.artStyle.toUpperCase();
  const quote = dna.quoteText.trim();
  const isPants = dna.garmentFamily === "PANTS";
  const vertical = isPants || style.includes("VERTICAL") || style.includes("SIDE");
  const stacked = style.includes("STACK") || style.includes("BOLD") || style.includes("STATEMENT");
  const compact = style.includes("MINIMAL") || style.includes("CHEST") || dna.placement.toUpperCase().includes("CHEST");

  let body: string;
  if (vertical) {
    const short = quote.length > 42 ? `${quote.slice(0, 40)}…` : quote;
    body = `<text text-anchor="middle" transform="translate(450 450) rotate(-90)"
      font-family="${CATALOG_FONT}" font-size="42" font-weight="800" letter-spacing="0.04em"
      fill="${ink}" stroke="rgba(0,0,0,0.28)" stroke-width="2.5" paint-order="stroke">${escapeSvg(short)}</text>`;
  } else {
    const max = compact ? 14 : stacked ? 16 : 18;
    const lines = wrapLines(quote, max);
    const size = compact ? 36 : stacked ? 48 : 42;
    const gap = compact ? 40 : stacked ? 56 : 48;
    const startY = 450 - ((lines.length - 1) * gap) / 2;
    const tspans = lines
      .map(
        (t, i) =>
          `<tspan x="450" y="${startY + i * gap}">${escapeSvg(t.toUpperCase())}</tspan>`,
      )
      .join("");
    body = `<text text-anchor="middle" font-family="${CATALOG_FONT}" font-size="${size}" font-weight="800"
      letter-spacing="0.02em" fill="${ink}" stroke="rgba(0,0,0,0.3)" stroke-width="2.5" paint-order="stroke">${tspans}</text>`;
  }

  const brandMark = `<text x="450" y="820" text-anchor="middle" font-family="${CATALOG_FONT}" font-size="14"
    font-weight="700" letter-spacing="0.22em" fill="${ink}" opacity="0.55">VERSE//MODE</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><style type="text/css"><![CDATA[${svgFontFaceCss()}]]></style></defs>
  ${body}
  ${brandMark}
</svg>`;
  const bytes = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .png({compressionLevel: 9})
    .toBuffer();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {bytes, sha256};
}
