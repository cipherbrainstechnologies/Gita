/** Customer-visible media labels — honest, no “AI” marketing shorthand. */
export const MODEL_PREVIEW_WATERMARK = "Generated on-model imagery · sample garment pending";
export const PHOTO_SAMPLE_WATERMARK = "Photographed supplier sample";
export const CONCEPT_NOT_FOR_SALE = "Concept preview · reservation not open";
export const EDITORIAL_DRAFT_NOTICE =
  "Editorial draft text — not published scripture. Physical production and supplier proof are still required.";

export const mediaAlt = (garment: string, view: string, line: string) =>
  `Generated ${view} on-model preview — ${garment} — “${line.slice(0, 80)}”`;