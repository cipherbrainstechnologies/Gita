import {createHash} from "node:crypto";
import sharp from "sharp";
import type {DesignDna} from "./design-dna";

export type QaResult =
  | {pass: true; fingerprint: string}
  | {pass: false; code: string; detail: string};

/** Deterministic checks — rejects obvious compositing defects; not a substitute for human review. */
export async function assessOnModelFrame(
  bytes: Buffer,
  dna: DesignDna,
  view: string,
): Promise<QaResult> {
  const fingerprint = createHash("sha256").update(bytes).digest("hex");
  const meta = await sharp(bytes).metadata();
  if (!meta.width || !meta.height || meta.width < 400) {
    return {pass: false, code: "LOW_RES", detail: "Output resolution too small"};
  }

  const stats = await sharp(bytes).stats();
  const rStd = stats.channels[0]?.stdev ?? 0;
  const gStd = stats.channels[1]?.stdev ?? 0;
  const bStd = stats.channels[2]?.stdev ?? 0;
  if (rStd < 8 && gStd < 8 && bStd < 8) {
    return {pass: false, code: "FLAT_RECT", detail: "Image lacks tonal variation (possible flat fill)"};
  }

  const quoteHash = createHash("sha256").update(dna.quoteText.trim(), "utf8").digest("hex");
  const expectedPrefix = quoteHash.slice(0, 8);
  const payload = `${dna.conceptId}:${view}:${expectedPrefix}`;
  const expected = createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 12);
  void expected;

  if (!dna.quoteText.trim()) {
    return {pass: false, code: "MISSING_COPY", detail: "SKU has no slogan text"};
  }

  return {pass: true, fingerprint};
}

export const QA_DISCLOSURE =
  "Digital on-model preview — not a factory sample photograph. CPU compositing or free-GPU VTON when available.";