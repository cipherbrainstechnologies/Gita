/** Pure studio-review rules (no I/O, safe for client components). */
export type ApprovalBlocker = "NO_ARTWORK" | "SIMULATION_ONLY";
export type ApprovalGate = {ok: boolean; blockers: ApprovalBlocker[]; demoOverrideUsed: boolean};

/**
 * A design may only be APPROVED when real (non-simulation) artwork exists. Sandbox/placeholder output is labelled SIMULATION_ONLY by the
 * worker and can never stand in for print-ready art. `demo` (DEMO_AUTH + explicit flag) overrides for walkthroughs and is recorded.
 */
export function evaluateApprovalGate(f: {hasArtwork: boolean; isSimulation: boolean}, opts: {demo: boolean}): ApprovalGate {
  const blockers: ApprovalBlocker[] = [];
  if (!f.hasArtwork) blockers.push("NO_ARTWORK");
  else if (f.isSimulation) blockers.push("SIMULATION_ONLY");
  if (blockers.length && opts.demo) return {ok: true, blockers: [], demoOverrideUsed: true};
  return {ok: blockers.length === 0, blockers, demoOverrideUsed: false};
}

export const APPROVAL_BLOCKER_MESSAGES: Record<ApprovalBlocker, string> = {
  NO_ARTWORK: "No generated or uploaded artwork exists for this candidate.",
  SIMULATION_ONLY: "Artwork is a labelled sandbox simulation, not real print-ready art."
};

export type ReviewChecklist = {provenanceLicence: boolean; quoteAuthenticity: boolean; culturalReview: boolean};
export type HumanReview = {decision: "APPROVE" | "REJECT"; resultingState: "APPROVED" | "REJECTED"; note: string; reviewer: string; reviewedAt: string; checklist?: ReviewChecklist; simulationOverride: boolean};

/** Appends the review to semanticReview without discarding automated findings. Non-object history is preserved under `previous`. */
export function mergeHumanReview(existing: unknown, review: HumanReview): Record<string, unknown> {
  const base: Record<string, unknown> = existing && typeof existing === "object" && !Array.isArray(existing) ? {...(existing as Record<string, unknown>)} : existing == null ? {} : {previous: existing};
  const history = Array.isArray(base.reviewHistory) ? base.reviewHistory : [];
  return {...base, humanReview: review, reviewHistory: [...history, review]};
}
