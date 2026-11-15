import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";

export type QaResult =
  | {pass: true; fingerprint: string}
  | {pass: false; code: string; detail: string};

/**
 * Blocking visual checks — reject opaque print plates and tee-for-pants composites.
 * Not a substitute for human screenshot review of the 20-SKU pilot.
 */
export async function assessOnModelFrame(
  bytes: Buffer,
  dna: DesignDna,
  view: string,
  meta?: {presentation?: "ON_MODEL" | "FLATLAY"; visualKind?: string},
): Promise<QaResult> {
  const fingerprint = createHash("sha256").update(bytes).digest("hex");
  const imageMeta = await sharp(bytes).metadata();
  if (!imageMeta.width || !imageMeta.height || imageMeta.width < 400) {
    return {pass: false, code: "LOW_RES", detail: "Output resolution too small"};
  }

  if (!dna.quoteText.trim()) {
    return {pass: false, code: "MISSING_COPY", detail: "SKU has no slogan text"};
  }

  if (dna.garmentFamily === "PANTS") {
    if (meta?.visualKind === "ON_MODEL_CPU_COMPOSITE" || meta?.presentation === "ON_MODEL") {
      return {
        pass: false,
        code: "PANTS_REQUIRES_FLATLAY_OR_REAL_PHOTO",
        detail: "Pants SKU cannot publish tee-based on-model composite",
      };
    }
    if (meta?.visualKind !== "PANTS_FLATLAY_PREVIEW" && meta?.presentation !== "FLATLAY") {
      return {
        pass: false,
        code: "PANTS_WRONG_PRESENTATION",
        detail: "Pants hero must be flat-lay or licensed pants photography",
      };
    }
  }

  const {data, info} = await sharp(bytes)
    .resize(180, 240, {fit: "fill"})
    .raw()
    .ensureAlpha()
    .toBuffer({resolveWithObject: true});

  // Detect large near-solid rectangular blobs (opaque artwork plate / mask spill)
  const cellW = 30;
  const cellH = 30;
  let worstSolid = 0;
  for (let cy = 0; cy < info.height - cellH; cy += cellH) {
    for (let cx = 0; cx < info.width - cellW; cx += cellW) {
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumR2 = 0;
      let n = 0;
      for (let y = cy; y < cy + cellH; y++) {
        for (let x = cx; x < cx + cellW; x++) {
          const o = (y * info.width + x) * 4;
          const r = data[o]!;
          const g = data[o + 1]!;
          const b = data[o + 2]!;
          sumR += r;
          sumG += g;
          sumB += b;
          sumR2 += r * r;
          n++;
        }
      }
      const meanR = sumR / n;
      const varR = sumR2 / n - meanR * meanR;
      const meanG = sumG / n;
      const meanB = sumB / n;
      // Saturated near-flat cells that are not near-white background
      const chroma = Math.max(meanR, meanG, meanB) - Math.min(meanR, meanG, meanB);
      if (varR < 40 && chroma > 35 && meanR < 245) {
        worstSolid = Math.max(worstSolid, chroma);
      }
    }
  }
  // Flat-lay intentionally uses solid fabric fills — skip plate detector there.
  // On-model tee composites must not show opaque print squares / mask polygons.
  if (meta?.presentation !== "FLATLAY" && worstSolid > 140) {
    return {
      pass: false,
      code: "OPAQUE_RECT_ARTIFACT",
      detail: `Solid colour plate / polygon artifact (chroma=${Math.round(worstSolid)})`,
    };
  }

  const stats = await sharp(bytes).stats();
  const rStd = stats.channels[0]?.stdev ?? 0;
  const gStd = stats.channels[1]?.stdev ?? 0;
  const bStd = stats.channels[2]?.stdev ?? 0;
  if (rStd < 8 && gStd < 8 && bStd < 8) {
    return {pass: false, code: "FLAT_RECT", detail: "Image lacks tonal variation (possible flat fill)"};
  }

  return {pass: true, fingerprint};
}

export const QA_DISCLOSURE =
  "Digital garment preview — not a factory sample. Tee previews use licensed editorial photography with transparent print; track pants use garment-accurate flat-lay until bottoms photography is commissioned.";
