import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {createCompanyStoreSchema} from "@/modules/admin/franchise/franchise.schema";
import {createCompanyStore, listStores} from "@/modules/admin/franchise/franchise.service";

export const dynamic = "force-dynamic";

export const GET = staffRoute(PERMISSIONS.franchiseRead, async () => jsonResponse({stores: await listStores(), demoAuth: demoAuth()}));

/** Creates an inactive COMPANY store pilot; refused (403) unless DEMO_AUTH=true. Franchise stores cannot be created here. */
export const POST = staffRoute(PERMISSIONS.franchiseWrite, async ({req, staff}) => {
  const input = parse(createCompanyStoreSchema, await readJson(req));
  return jsonResponse({store: await createCompanyStore(staff, input)}, 201);
});
