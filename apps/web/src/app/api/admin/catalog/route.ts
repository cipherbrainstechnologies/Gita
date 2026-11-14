import {staffRoute, jsonResponse, parse, readJson} from "@/modules/admin/shared/http";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {createProductSchema, updateProductSchema} from "@/modules/admin/catalog/catalog.schema";
import {createProduct, listCatalog, updateProduct} from "@/modules/admin/catalog/catalog.service";

export const dynamic = "force-dynamic";

/** GET: all products with variants, derived preorder-gate blockers and real (confirmed) capacity only. */
export const GET = staffRoute(PERMISSIONS.catalogRead, async () => jsonResponse({products: await listCatalog(), demoAuth: demoAuth()}));

/** POST: create a CONCEPT product. Status can never be supplied here. */
export const POST = staffRoute(PERMISSIONS.catalogWrite, async ({req, staff}) => {
  const input = parse(createProductSchema, await readJson(req));
  return jsonResponse({product: await createProduct(staff, input)}, 201);
});

/** PATCH: edit fields and/or move status along CONCEPT -> SAMPLE_PENDING -> SAMPLE_APPROVED -> PREORDER with server-side gates. */
export const PATCH = staffRoute(PERMISSIONS.catalogWrite, async ({req, staff}) => {
  const input = parse(updateProductSchema, await readJson(req));
  return jsonResponse({product: await updateProduct(staff, input)});
});
