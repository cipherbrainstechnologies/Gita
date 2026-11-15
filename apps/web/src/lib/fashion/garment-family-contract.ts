import type {DesignDna} from "./design-dna";
import {findSourceByPath, pantsModelPhotoCount} from "./source-reference-library";

export type PresentationMode = "ON_MODEL" | "FLATLAY" | "NEEDS_ASSET";

export type GarmentContract = {
  ok: boolean;
  presentation: PresentationMode;
  code?: string;
  detail?: string;
};

/**
 * Hard gate before render / publish / card display.
 * PANTS must never bind to tee-only photography.
 */
export function resolveGarmentPresentation(
  dna: DesignDna,
  sourceAssetPath?: string,
): GarmentContract {
  if (dna.garmentFamily === "PANTS") {
    if (sourceAssetPath) {
      const ref = findSourceByPath(sourceAssetPath);
      if (!ref || ref.garmentFamily !== "PANTS") {
        return {
          ok: false,
          presentation: "FLATLAY",
          code: "TEE_PHOTO_FOR_PANTS",
          detail: "Track pant SKUs cannot use T-shirt source photography",
        };
      }
    }
    if (pantsModelPhotoCount() === 0) {
      return {
        ok: true,
        presentation: "FLATLAY",
        code: "PANTS_FLATLAY_FALLBACK",
        detail: "No licensed pants on-model photos; use garment-accurate flat-lay",
      };
    }
    return {ok: true, presentation: "ON_MODEL"};
  }

  if (sourceAssetPath) {
    const ref = findSourceByPath(sourceAssetPath);
    if (ref && ref.garmentFamily !== "TEES") {
      return {
        ok: false,
        presentation: "NEEDS_ASSET",
        code: "WRONG_FAMILY_SOURCE",
        detail: `Tee SKU cannot use ${ref.garmentFamily} source`,
      };
    }
  }
  // USP catalog default: unique designer tee flat-lay with mindset print.
  // Shared editorial on-model plates are never storefront-primary until per-SKU sample photos exist.
  return {
    ok: true,
    presentation: "FLATLAY",
    code: "TEE_DESIGNER_FLATLAY",
    detail: "Designer tee flat-lay with unique print — not a shared model plate",
  };
}

export function assertPantsNotTeePhoto(dna: DesignDna, sourceAssetPath: string): void {
  if (dna.garmentFamily !== "PANTS") return;
  const ref = findSourceByPath(sourceAssetPath);
  if (!ref || ref.garmentFamily !== "PANTS") {
    throw new Error(`TEE_PHOTO_FOR_PANTS:${dna.conceptId}:${sourceAssetPath}`);
  }
}
