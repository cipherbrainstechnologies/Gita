/** Durable AI apparel pipeline stages (V2). Jobs must persist stage history across restarts. */
export const STUDIO_PIPELINE_STAGES = [
  "SOURCE_DISCOVERY",
  "PROVENANCE_RIGHTS_CHECK",
  "CONTENT_DEDUP",
  "SEMANTIC_EDITOR",
  "LOCALE_DRAFT",
  "HUMAN_LANGUAGE_REVIEW",
  "DESIGN_BRIEF",
  "DRAW_AND_LAYOUT",
  "PRINT_ASSET_EXPORT",
  "GARMENT_MOCKUP",
  "ON_MODEL_SIMULATION",
  "VISUAL_QA",
  "MERCHANDISER_APPROVAL",
  "SUPPLIER_TECH_PACK",
  "SAMPLE_SIGNOFF",
  "PREORDER_ELIGIBLE",
] as const;

export type StudioPipelineStage = (typeof STUDIO_PIPELINE_STAGES)[number];

export function nextStage(current: StudioPipelineStage): StudioPipelineStage | null {
  const i = STUDIO_PIPELINE_STAGES.indexOf(current);
  if (i < 0 || i >= STUDIO_PIPELINE_STAGES.length - 1) return null;
  return STUDIO_PIPELINE_STAGES[i + 1] ?? null;
}
