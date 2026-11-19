import type {CatalogProduct} from "../catalog";
import {commerceFlags} from "./flags";
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
  const fashionMismatches: Array<{slug: string; field: string; legacy: string; medusa: string}> = [];
  for (const l of legacy) {
    const m = medusa.find((x) => x.slug === l.slug);
    if (!m) continue;
    for (const field of ["category", "palette", "status"] as const) {
      if (l[field] !== m[field]) {
        fashionMismatches.push({slug: l.slug, field, legacy: String(l[field]), medusa: String(m[field])});
      }
    }
  }
  console.info("[medusa-shadow]", {
    legacyCount: legacy.length,
    medusaCount: medusa.length,
    onlyLegacySample: onlyLegacy,
    onlyMedusaSample: onlyMedusa,
    fashionMismatchSample: fashionMismatches.slice(0, 15),
    fashionMismatchCount: fashionMismatches.length,
  });
}