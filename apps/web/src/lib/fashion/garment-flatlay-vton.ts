import sharp from "sharp";
import type {DesignDna} from "./design-dna";
import {renderArtworkPng} from "./artwork-raster";
import {printBox} from "./garment-placements";

const FLAT_W = 768;
const FLAT_H = 1024;

/** Shaped flat-lay garment (not a coloured rectangle) for free local/Colab VTON. */
export async function renderFlatGarmentForVton(dna: DesignDna, side: "front" | "back"): Promise<Buffer> {
  const isPants = dna.garmentFamily === "PANTS";
  const body = isPants
    ? `<path d="M 120 80 L 300 40 L 468 40 L 648 80 L 680 900 L 484 980 L 284 980 L 88 900 Z" fill="${dna.colourHex}"/>
       <path d="M 200 120 L 240 880 M 568 120 L 528 880" stroke="${dna.accentHex}" stroke-width="3" opacity="0.35"/>`
    : `<path d="M 90 120 Q 384 50 678 120 L 720 520 L 620 940 Q 384 1000 148 940 L 48 520 Z" fill="${dna.colourHex}"/>
       <ellipse cx="384" cy="95" rx="120" ry="45" fill="${dna.colourHex}"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${FLAT_W}" height="${FLAT_H}" viewBox="0 0 ${FLAT_W} ${FLAT_H}">
  <rect width="100%" height="100%" fill="#f0eeea"/>
  ${body}
</svg>`;

  let base = sharp(Buffer.from(svg)).png();
  const art = await renderArtworkPng(dna);
  const box = printBox(dna, side);
  if (box) {
    const scaleX = FLAT_W / 1080;
    const scaleY = FLAT_H / 1440;
    const artSized = await sharp(art.bytes)
      .resize(Math.round(box.width * scaleX), Math.round(box.height * scaleY), {fit: "inside"})
      .png()
      .toBuffer();
    base = sharp(await base.toBuffer()).composite([
      {
        input: artSized,
        left: Math.round(box.left * scaleX),
        top: Math.round(box.top * scaleY),
      },
    ]);
  }
  return base.png().toBuffer();
}