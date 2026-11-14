import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {createPromotionSchema} from "@/modules/admin/marketing/marketing.schema";
import {createPromotion, listPromotions} from "@/modules/admin/marketing/marketing.service";

export const dynamic = "force-dynamic";

export const GET = staffRoute(PERMISSIONS.marketingRead, async () => jsonResponse({promotions: await listPromotions()}));

/** Create a simple percent-off promotion. Dates need an explicit UTC offset; new promotions default to inactive. */
export const POST = staffRoute(PERMISSIONS.marketingWrite, async ({req, staff}) => {
  const input = parse(createPromotionSchema, await readJson(req));
  return jsonResponse({promotion: await createPromotion(staff, input)}, 201);
});
