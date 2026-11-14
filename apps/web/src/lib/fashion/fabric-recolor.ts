import sharp from "sharp";
import {hexToRgb} from "./color-utils";

/** Recolour garment region only — preserves luminance; does not tint skin (mask excludes face/limbs). */
export async function recolourGarment(
  baseRgb: Buffer,
  maskPng: Buffer,
  colourHex: string,
  strength = 0.55,
): Promise<Buffer> {
  const {r, g, b} = hexToRgb(colourHex);
  const {data, info} = await sharp(baseRgb).raw().ensureAlpha().toBuffer({resolveWithObject: true});
  const mask = await sharp(maskPng).resize(info.width, info.height).greyscale().raw().toBuffer();

  const out = Buffer.from(data);
  for (let i = 0; i < info.width * info.height; i++) {
    const mi = mask[i] ?? 0;
    if (mi < 32) continue;
    const o = i * 4;
    const lum = (out[o]! * 0.299 + out[o + 1]! * 0.587 + out[o + 2]! * 0.114) / 255;
    const t = (mi / 255) * strength;
    out[o] = Math.round(out[o]! * (1 - t) + r * lum * t);
    out[o + 1] = Math.round(out[o + 1]! * (1 - t) + g * lum * t);
    out[o + 2] = Math.round(out[o + 2]! * (1 - t) + b * lum * t);
  }
  return sharp(out, {raw: {width: info.width, height: info.height, channels: 4}}).png().toBuffer();
}