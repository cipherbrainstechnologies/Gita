import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {approvalsQuerySchema, decisionSchema} from "@/modules/admin/studio/studio.schema";
import {decide, listApprovals} from "@/modules/admin/studio/studio.service";

export const dynamic = "force-dynamic";

/** Inbox: DesignCandidate rows in NEEDS_HUMAN_REVIEW with their latest version and approval-gate blockers. */
export const GET = staffRoute(PERMISSIONS.studio, async ({req}) => {
  const q = parse(approvalsQuerySchema, {limit: new URL(req.url).searchParams.get("limit") ?? undefined});
  return jsonResponse({candidates: await listApprovals(q.limit), demoAuth: demoAuth()});
});

/** Decision: approve -> APPROVED, reject -> REJECTED, reviewer note stored in semanticReview. Never publishes a Product. */
export const POST = staffRoute(PERMISSIONS.studio, async ({req, staff}) => {
  const input = parse(decisionSchema, await readJson(req));
  return jsonResponse(await decide(staff, input));
});
