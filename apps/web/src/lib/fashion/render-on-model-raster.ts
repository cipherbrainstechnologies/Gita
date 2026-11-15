import type {DesignDna} from "./design-dna";
import {resolveGarmentPresentation} from "./garment-family-contract";
import {renderPantsFlatlay} from "./pants-flatlay-raster";
import {renderTeeFlatlay} from "./tee-flatlay-raster";
import type {OnModelView} from "./on-model-types";

export type {OnModelView};

/** Bump forces batch re-render — designer flat-lay USP (no shared model plates). */
export const RENDERER_VERSION = "cpu-designer-flatlay-v5";

/**
 * Storefront renderer — unique designer garment + mindset print per SKU.
 * Tees and track pants are both designed pieces; never reuse shared KARMA/Quiet plates.
 * Photographed physical samples can replace flat-lays later without changing this contract.
 */
export async function renderOnModelRaster(
  dna: DesignDna,
  view: OnModelView,
): Promise<{
  bytes: Buffer;
  sha256: string;
  mimeType: "image/webp";
  modelIdentityId: string;
  rendererVersion: string;
  presentation: "ON_MODEL" | "FLATLAY";
  visualKind: string;
}> {
  void resolveGarmentPresentation(dna);

  if (dna.garmentFamily === "PANTS") {
    const flat = await renderPantsFlatlay(dna, view);
    return {
      ...flat,
      modelIdentityId: dna.modelIdentityId,
      rendererVersion: RENDERER_VERSION,
      presentation: "FLATLAY",
      visualKind: "PANTS_FLATLAY_PREVIEW",
    };
  }

  const flat = await renderTeeFlatlay(dna, view);
  return {
    ...flat,
    modelIdentityId: dna.modelIdentityId,
    rendererVersion: RENDERER_VERSION,
    presentation: "FLATLAY",
    visualKind: "TEE_FLATLAY_PREVIEW",
  };
}

export function onModelApiPath(slug: string, view: OnModelView): string {
  return `/api/catalog/on-model/${encodeURIComponent(slug)}/${view}`;
}

export function staticOnModelPath(storageKey: string): string {
  return `/api/assets/generated/${storageKey}`;
}
