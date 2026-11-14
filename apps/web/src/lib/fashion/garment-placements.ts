import type {DesignDna} from "./design-dna";
import type {OnModelView} from "./render-on-model-raster";

export type PrintBox = {left: number; top: number; width: number; height: number};

const W = 1080;
const H = 1440;

export function printBox(dna: DesignDna, view: OnModelView): PrintBox | null {
  if (view !== "front" && view !== "back") return null;
  const isPants = dna.garmentFamily === "PANTS";
  if (isPants) {
    return view === "back"
      ? {left: Math.floor(W * 0.32), top: Math.floor(H * 0.42), width: Math.floor(W * 0.36), height: Math.floor(H * 0.22)}
      : {left: Math.floor(W * 0.28), top: Math.floor(H * 0.38), width: Math.floor(W * 0.44), height: Math.floor(H * 0.2)};
  }
  const placement = dna.placement.toUpperCase();
  if (view === "back" || placement.includes("BACK")) {
    return {left: Math.floor(W * 0.22), top: Math.floor(H * 0.34), width: Math.floor(W * 0.56), height: Math.floor(H * 0.38)};
  }
  return {left: Math.floor(W * 0.3), top: Math.floor(H * 0.38), width: Math.floor(W * 0.4), height: Math.floor(H * 0.22)};
}

export function garmentMaskSvg(dna: DesignDna, view: OnModelView): string {
  const isPants = dna.garmentFamily === "PANTS";
  if (isPants) {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <path fill="white" d="M 220 260 L 380 220 L 700 220 L 860 260 L 900 1180 L 700 1320 L 380 1320 L 180 1180 Z"/>
      <rect fill="black" x="0" y="0" width="${W}" height="200"/>
      <rect fill="black" x="0" y="1280" width="${W}" height="160"/>
    </svg>`;
  }
  if (view === "back") {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <path fill="white" d="M 150 320 Q 540 260 930 320 L 990 920 Q 540 980 90 920 Z"/>
      <ellipse fill="black" cx="540" cy="230" rx="200" ry="95"/>
      <rect fill="black" x="0" y="1100" width="${W}" height="340"/>
    </svg>`;
  }
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <path fill="white" d="M 130 340 Q 540 270 990 340 L 1040 940 Q 540 1000 80 940 Z"/>
    <ellipse fill="black" cx="540" cy="260" rx="210" ry="100"/>
    <rect fill="black" x="0" y="1150" width="${W}" height="290"/>
  </svg>`;
}

export const FRAME = {width: W, height: H};