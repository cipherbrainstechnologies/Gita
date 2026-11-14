import {z} from "zod";
import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {INTEGRATION_PROVIDERS, testIntegration} from "@/modules/admin/integrations/integrations.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({provider: z.enum(INTEGRATION_PROVIDERS)}).strict();

/**
 * Superadmin-only connection test. Result status is NOT_CONFIGURED | SANDBOX | LIVE_VERIFIED | FAILED.
 * Missing keys are NOT_CONFIGURED, never success; providers without a test adapter report FAILED/NO_TEST_ADAPTER.
 */
export const POST = staffRoute(PERMISSIONS.integrations, async ({req, staff}) => {
  const {provider} = parse(schema, await readJson(req));
  return jsonResponse(await testIntegration(staff, provider));
});
