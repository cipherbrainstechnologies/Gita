import sharp from "sharp";
import {hexToRgb} from "./color-utils";

/**
 * Recolour garment region only — luminance-preserving.
 * Requires a tight aligned mask; skips near-skin luminance to reduce face/neck spill.
 */
export async function recolourGarment(
  baseRgb: Buffer,
  maskPng: Buffer,
  colourHex: string,
  strength = 0.42,
): Promise<Buffer> {
  const {r, g, b} = hexToRgb(colourHex);
  const {data, info} = await sharp(baseRgb).raw().ensureAlpha().toBuffer({resolveWithObject: true});
  const mask = await sharp(maskPng).resize(info.width, info.height).greyscale().raw().toBuffer();

  const out = Buffer.from(data);
  for (let i = 0; i < info.width * info.height; i++) {
    const mi = mask[i] ?? 0;
    if (mi < 48) continue;
    const o = i * 4;
    const pr = out[o]!;
    const pg = out[o + 1]!;
    const pb = out[o + 2]!;
    // Skip skin-like pixels even if mask spills
    const max = Math.max(pr, pg, pb);
    const min = Math.min(pr, pg, pb);
    const isSkin =
      pr > 90 &&
      pg > 60 &&
      pb > 40 &&
      pr >= pg &&
      pg >= pb &&
      max - min < 90 &&
      pr - pb > 15;
    if (isSkin) continue;

    const lum = (pr * 0.299 + pg * 0.587 + pb * 0.114) / 255;
    const t = (mi / 255) * strength;
    out[o] = Math.round(pr * (1 - t) + r * lum * t);
    out[o + 1] = Math.round(pg * (1 - t) + g * lum * t);
    out[o + 2] = Math.round(pb * (1 - t) + b * lum * t);
  }
  return sharp(out, {raw: {width: info.width, height: info.height, channels: 4}}).png().toBuffer();
}
