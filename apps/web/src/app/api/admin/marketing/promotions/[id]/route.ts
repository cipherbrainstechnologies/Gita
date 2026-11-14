import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {updatePromotionSchema} from "@/modules/admin/marketing/marketing.schema";
import {deletePromotion, updatePromotion} from "@/modules/admin/marketing/marketing.service";

export const dynamic = "force-dynamic";

export const PATCH = staffRoute<{id: string}>(PERMISSIONS.marketingWrite, async ({req, staff, params}) => {
  const input = parse(updatePromotionSchema, await readJson(req));
  return jsonResponse({promotion: await updatePromotion(staff, params.id, input)});
});

/** Only never-redeemed promotions can be deleted; otherwise deactivate. */
export const DELETE = staffRoute<{id: string}>(PERMISSIONS.marketingWrite, async ({staff, params}) => jsonResponse(await deletePromotion(staff, params.id)));
