import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {ApiError} from "../shared/http";
import {writeAudit} from "../shared/audit";
import {demoAuth} from "../shared/permissions";
import {APPROVAL_BLOCKER_MESSAGES, evaluateApprovalGate, mergeHumanReview, type ApprovalBlocker, type HumanReview} from "./studio.rules";
import type {DecisionInput} from "./studio.schema";
import * as repo from "./studio.repository";

export type ApprovalDto = {
  id: string; fingerprint: string; quoteText: string; theme: string; garmentFamily: string; artFamily: string; similarityFlag: boolean; createdAt: string;
  automatedReview: unknown;
  version: {revision: number; modelName: string | null; modelLicense: string | null; outputLicense: string | null; approvalStatus: string; isSimulation: boolean} | null;
  gate: {ok: boolean; blockers: ApprovalBlocker[]};
};
export type JobDto = {id: string; kind: string; status: string; total: number; processed: number; error: string | null; createdAt: string; completedAt: string | null};

/** Strips prior human decisions so the inbox only surfaces automated findings. */
function automated(review: unknown): unknown {
  if (!review || typeof review !== "object" || Array.isArray(review)) return review ?? null;
  const {humanReview: _h, reviewHistory: _r, ...rest} = review as Record<string, unknown>;
  void _h; void _r;
  return Object.keys(rest).length ? rest : null;
}

export async function listApprovals(limit = 50): Promise<ApprovalDto[]> {
  const cands = await repo.pendingCandidates(prisma, limit);
  const versions = await repo.versionsFor(prisma, cands.map(c => c.id));
  const assets = await repo.assetsByIds(prisma, versions.flatMap(v => (v.artworkAssetId ? [v.artworkAssetId] : [])));
  return cands.map(c => {
    const v = versions.find(x => x.candidateId === c.id) ?? null; // versions are ordered newest revision first
    const asset = v?.artworkAssetId ? assets.find(a => a.id === v.artworkAssetId) : undefined;
    const isSimulation = v ? v.approvalStatus === "SIMULATION_ONLY" || asset?.isSimulation === true : false;
    const gate = evaluateApprovalGate({hasArtwork: Boolean(v && v.artworkAssetId), isSimulation}, {demo: false});
    return {
      id: c.id, fingerprint: c.fingerprint, quoteText: c.quoteText, theme: c.theme, garmentFamily: c.garmentFamily, artFamily: c.artFamily,
      similarityFlag: c.similarityFlag, createdAt: c.createdAt.toISOString(), automatedReview: automated(c.semanticReview),
      version: v ? {revision: v.revision, modelName: v.modelName, modelLicense: v.modelLicense, outputLicense: v.outputLicense, approvalStatus: v.approvalStatus, isSimulation} : null,
      gate: {ok: gate.ok, blockers: gate.blockers}
    };
  });
}

export async function listJobs(take = 30): Promise<JobDto[]> {
  return (await repo.recentJobs(prisma, take)).map(j => ({...j, createdAt: j.createdAt.toISOString(), completedAt: j.completedAt?.toISOString() ?? null}));
}

/**
 * Records the human decision. APPROVE -> APPROVED, REJECT -> REJECTED. Never creates, updates or publishes a Product:
 * an approved design still needs a supplier proof and a separate catalog action.
 */
export async function decide(staff: StaffIdentity, input: DecisionInput) {
  if (input.demoAllowSimulation && !demoAuth()) throw new ApiError(403, "DEMO_DISABLED", "demoAllowSimulation is only honoured when DEMO_AUTH=true.");
  return prisma.$transaction(async tx => {
    const cand = await repo.findCandidate(tx, input.candidateId);
    if (!cand) throw new ApiError(404, "CANDIDATE_NOT_FOUND", "Design candidate not found.");
    if (cand.state !== "NEEDS_HUMAN_REVIEW") throw new ApiError(409, "NOT_AWAITING_REVIEW", `Candidate is ${cand.state}, not awaiting review.`);
    const version = (await repo.versionsFor(tx, [cand.id]))[0] ?? null;
    const asset = version?.artworkAssetId ? (await repo.assetsByIds(tx, [version.artworkAssetId]))[0] : undefined;
    const isSimulation = version ? version.approvalStatus === "SIMULATION_ONLY" || asset?.isSimulation === true : false;

    let override = false;
    if (input.decision === "APPROVE") {
      const gate = evaluateApprovalGate({hasArtwork: Boolean(version?.artworkAssetId), isSimulation}, {demo: Boolean(input.demoAllowSimulation) && demoAuth()});
      if (!gate.ok) throw new ApiError(409, "APPROVAL_GATE_FAILED", "This candidate cannot be approved yet.", gate.blockers.map(b => ({code: b, message: APPROVAL_BLOCKER_MESSAGES[b]})));
      override = gate.demoOverrideUsed;
    }
    const resultingState = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";
    const review: HumanReview = {decision: input.decision, resultingState, note: input.note, reviewer: staff.email, reviewedAt: new Date().toISOString(), checklist: input.checklist, simulationOverride: override};
    const merged = mergeHumanReview(cand.semanticReview, review) as Prisma.InputJsonValue;
    if ((await repo.decideGuarded(tx, cand.id, resultingState, merged)) !== 1) throw new ApiError(409, "CONCURRENT_REVIEW", "Another reviewer decided this candidate first.");
    // Simulation placeholders keep their SIMULATION_ONLY label even when a demo approval is recorded.
    if (version && version.approvalStatus !== "SIMULATION_ONLY") await repo.setVersionApproval(tx, version.id, resultingState, staff.email);
    await writeAudit(tx, staff, input.decision === "APPROVE" ? "DESIGN_APPROVED" : "DESIGN_REJECTED", cand.id, {fingerprint: cand.fingerprint, note: input.note, simulationOverride: override, checklist: input.checklist ?? null});
    return {candidateId: cand.id, state: resultingState, productPublished: false as const};
  });
}
