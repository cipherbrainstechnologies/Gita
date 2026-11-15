import type {DesignDna} from "./design-dna";
import type {OnModelView} from "./on-model-types";
import {findSourceByPath} from "./source-reference-library";

export type PrintBox = {left: number; top: number; width: number; height: number};
export type MaskQuality = "ALIGNED" | "NONE" | "NEEDS_REFERENCE_MASK";

const W = 1080;
const H = 1440;

export function printBox(dna: DesignDna, view: OnModelView): PrintBox | null {
  if (view !== "front" && view !== "back" && view !== "detail") return null;
  const isPants = dna.garmentFamily === "PANTS";
  if (isPants) {
    // Designer thigh / side panel — readable mindset line, never a chest plate
    if (view === "detail") {
      return {left: Math.floor(W * 0.28), top: Math.floor(H * 0.42), width: Math.floor(W * 0.44), height: Math.floor(H * 0.16)};
    }
    return view === "back"
      ? {left: Math.floor(W * 0.3), top: Math.floor(H * 0.46), width: Math.floor(W * 0.4), height: Math.floor(H * 0.16)}
      : {left: Math.floor(W * 0.3), top: Math.floor(H * 0.42), width: Math.floor(W * 0.4), height: Math.floor(H * 0.16)};
  }
  const placement = dna.placement.toUpperCase();
  if (view === "detail") {
    return {left: Math.floor(W * 0.22), top: Math.floor(H * 0.34), width: Math.floor(W * 0.56), height: Math.floor(H * 0.28)};
  }
  if (view === "back" || placement.includes("BACK")) {
    // Large back statement — USP hero
    return {left: Math.floor(W * 0.2), top: Math.floor(H * 0.32), width: Math.floor(W * 0.6), height: Math.floor(H * 0.28)};
  }
  if (placement.includes("CHEST") || placement.includes("LEFT")) {
    return {left: Math.floor(W * 0.36), top: Math.floor(H * 0.36), width: Math.floor(W * 0.28), height: Math.floor(H * 0.12)};
  }
  // Centre chest statement on designer tee flat-lay
  return {left: Math.floor(W * 0.24), top: Math.floor(H * 0.36), width: Math.floor(W * 0.52), height: Math.floor(H * 0.22)};
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
