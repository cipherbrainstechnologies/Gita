import type {DesignDna} from "./design-dna";
import type {OnModelView} from "./on-model-types";
import {findSourceByPath} from "./source-reference-library";

export type PrintBox = {left: number; top: number; width: number; height: number};
export type MaskQuality = "ALIGNED" | "NONE" | "NEEDS_REFERENCE_MASK";

const W = 1080;
const H = 1440;

export function printBox(dna: DesignDna, view: OnModelView): PrintBox | null {
  if (view !== "front" && view !== "back") return null;
  const isPants = dna.garmentFamily === "PANTS";
  if (isPants) {
    // Thigh / calf panel — never a giant chest square
    return view === "back"
      ? {left: Math.floor(W * 0.34), top: Math.floor(H * 0.48), width: Math.floor(W * 0.32), height: Math.floor(H * 0.12)}
      : {left: Math.floor(W * 0.34), top: Math.floor(H * 0.44), width: Math.floor(W * 0.32), height: Math.floor(H * 0.12)};
  }
  const placement = dna.placement.toUpperCase();
  if (view === "back" || placement.includes("BACK")) {
    return {left: Math.floor(W * 0.28), top: Math.floor(H * 0.36), width: Math.floor(W * 0.44), height: Math.floor(H * 0.2)};
  }
  // Compact chest print — not 800×800 opaque plate
  return {left: Math.floor(W * 0.32), top: Math.floor(H * 0.4), width: Math.floor(W * 0.36), height: Math.floor(H * 0.14)};
}

/**
 * Reference-aligned torso mask for known black-tee editorials.
 * Tight chest band only; face/neck/arms/background excluded.
 */
export function garmentMaskSvg(
  dna: DesignDna,
  view: OnModelView,
  sourceAssetPath?: string,
): {svg: string; quality: MaskQuality} {
  if (dna.garmentFamily === "PANTS") {
    return {svg: "", quality: "NEEDS_REFERENCE_MASK"};
  }

  const ref = sourceAssetPath ? findSourceByPath(sourceAssetPath) : undefined;
  if (ref && ref.maskStatus !== "ALIGNED") {
    return {svg: "", quality: "NEEDS_REFERENCE_MASK"};
  }

  // Soft rounded chest panel only (white = garment). Everything else black.
  if (view === "back") {
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black"/>
      <ellipse cx="540" cy="620" rx="280" ry="220" fill="white"/>
    </svg>`;
    return {svg, quality: "ALIGNED"};
  }

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="black"/>
    <ellipse cx="540" cy="640" rx="260" ry="200" fill="white"/>
  </svg>`;
  return {svg, quality: "ALIGNED"};
}

export const FRAME = {width: W, height: H};
