import type {DesignState, Prisma} from "@prisma/client";
import type {Db} from "../shared/audit";

export const pendingCandidates = (db: Db, take: number) =>
  db.designCandidate.findMany({where: {state: "NEEDS_HUMAN_REVIEW"}, orderBy: [{similarityFlag: "desc"}, {createdAt: "asc"}], take});

export const versionsFor = (db: Db, candidateIds: string[]) =>
  candidateIds.length ? db.designVersion.findMany({where: {candidateId: {in: candidateIds}}, orderBy: {revision: "desc"}}) : Promise.resolve([]);

export const assetsByIds = (db: Db, ids: string[]) =>
  ids.length ? db.mediaAsset.findMany({where: {id: {in: ids}}, select: {id: true, isSimulation: true, mimeType: true}}) : Promise.resolve([]);

export const findCandidate = (db: Db, id: string) => db.designCandidate.findUnique({where: {id}});

/** Only a candidate still awaiting review can be decided; guards double-submit and concurrent reviewers. */
export const decideGuarded = async (db: Db, id: string, state: DesignState, semanticReview: Prisma.InputJsonValue) =>
  (await db.designCandidate.updateMany({where: {id, state: "NEEDS_HUMAN_REVIEW"}, data: {state, semanticReview}})).count;

export const setVersionApproval = (db: Db, versionId: string, approvalStatus: string, approverId: string) =>
  db.designVersion.update({where: {id: versionId}, data: {approvalStatus, approverId}});

export const recentJobs = (db: Db, take: number) =>
  db.jobRun.findMany({orderBy: {createdAt: "desc"}, take, select: {id: true, kind: true, status: true, total: true, processed: true, error: true, createdAt: true, completedAt: true}});
