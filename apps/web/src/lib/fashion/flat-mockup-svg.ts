import {createHash} from "node:crypto";
import type {DesignDna} from "@/lib/fashion/design-dna";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapQuote(text: string, maxPerLine = 28): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxPerLine && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

/** Deterministic flat-lay / artwork SVG — not a shared photograph. */
export function renderFlatMockupSvg(dna: DesignDna, view: "front" | "back" | "detail"): string {
  const w = 800;
  const h = 1000;
  const bgHue = dna.renderSeed % 360;
  const bg = `hsl(${bgHue} 22% 92%)`;
  const isPants = dna.garmentFamily === "PANTS";
  const quoteLines = wrapQuote(dna.quoteText);
  const lines = quoteLines
    .map(
      (t, i) =>
        `<text x="400" y="${view === "back" ? 520 : 440}" dy="${i * 38}" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="${dna.accentHex}">${escapeXml(t)}</text>`
    )
    .join("");

  const garmentPath = isPants
    ? `<path d="M220 180 Q400 140 580 180 L620 900 Q400 920 180 900 Z" fill="${dna.colourHex}" stroke="${dna.accentHex}" stroke-width="3"/>
       <path d="M260 220 L300 880 M540 220 L500 880" stroke="${dna.accentHex}" stroke-width="2" opacity="0.4"/>
       <rect x="340" y="240" width="120" height="80" rx="8" fill="${dna.accentHex}" opacity="0.15"/>`
    : `<path d="M160 220 Q400 120 640 220 L680 420 L580 880 Q400 920 220 880 L120 420 Z" fill="${dna.colourHex}" stroke="${dna.accentHex}" stroke-width="3"/>
       <ellipse cx="400" cy="200" rx="90" ry="40" fill="${dna.colourHex}" stroke="${dna.accentHex}" stroke-width="2"/>`;

  const viewLabel =
    view === "back" ? "BACK" : view === "detail" ? "DETAIL" : "FRONT";
  const meta = `${dna.garmentCut} · ${dna.colourwayId} · ${dna.artStyle}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="32" y="48" font-family="system-ui,sans-serif" font-size="14" fill="#334155">${escapeXml(dna.conceptId)} · ${viewLabel}</text>
  <text x="32" y="72" font-family="system-ui,sans-serif" font-size="12" fill="#64748b">${escapeXml(meta)}</text>
  ${garmentPath}
  ${view === "detail" ? `<rect x="280" y="360" width="240" height="200" rx="12" fill="${dna.accentHex}" opacity="0.25"/>` : lines}
  <text x="768" y="980" text-anchor="end" font-size="11" fill="#94a3b8">TYPOGRAPHIC PREVIEW · ${dna.modelIdentityId}</text>
</svg>`;
}

export function contentSha256FromSvg(svg: string): string {
  return createHash("sha256").update(svg, "utf8").digest("hex");
}