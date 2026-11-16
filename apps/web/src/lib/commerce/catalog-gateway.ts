import type {CatalogProduct} from "../catalog";
import {commerceFlags} from "./flags";
import {getProductFromMedusa, listCatalogFromMedusa} from "./medusa-catalog-adapter";

export function shouldReadMedusaCatalog(): boolean {
  return commerceFlags.backend() === "medusa" || commerceFlags.medusaCatalogRead();
}

/** Internal shadow diff — logs only when MEDUSA_SHADOW_COMPARE=true (never returned to clients). */
export async function shadowCompareCatalog(
  legacy: CatalogProduct[],
  medusa: CatalogProduct[],
): Promise<void> {
  if (!commerceFlags.shadowCompare()) return;
  const legacySlugs = new Set(legacy.map((p) => p.slug));
  const medusaSlugs = new Set(medusa.map((p) => p.slug));
  const onlyLegacy = [...legacySlugs].filter((s) => !medusaSlugs.has(s)).slice(0, 10);
  const onlyMedusa = [...medusaSlugs].filter((s) => !legacySlugs.has(s)).slice(0, 10);
  console.info("[medusa-shadow]", {
    legacyCount: legacy.length,
    medusaCount: medusa.length,
  onlyLegacySample: onlyLegacy,
    onlyMedusaSample: onlyMedusa,
  });
}