import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {setVariantEnabledSchema, upsertVariantSchema} from "@/modules/admin/catalog/catalog.schema";
import {setVariantEnabled, upsertVariant} from "@/modules/admin/catalog/catalog.service";

export const dynamic = "force-dynamic";

/** POST: upsert a variant by unique SKU. Prices are integer paise (number or digit string). New variants start disabled. */
export const POST = staffRoute(PERMISSIONS.catalogWrite, async ({req, staff}) => {
  const input = parse(upsertVariantSchema, await readJson(req));
  const r = await upsertVariant(staff, input);
  return jsonResponse(r, r.created ? 201 : 200);
});

/** PATCH: enable/disable a variant. Enabling needs an approved sample and a tax rate. */
export const PATCH = staffRoute(PERMISSIONS.catalogWrite, async ({req, staff}) => {
  const input = parse(setVariantEnabledSchema, await readJson(req));
  return jsonResponse({product: await setVariantEnabled(staff, input)});
});
