import {createHash} from "node:crypto";

export type DesignDna = {
  conceptId: string;
  quoteFingerprint: string;
  quoteText: string;
  language: string;
  garmentFamily: "TEES" | "PANTS";
  garmentCut: string;
  colourwayId: string;
  colourHex: string;
  accentHex: string;
  artStyle: string;
  modelIdentityId: string;
  sceneId: string;
  renderSeed: number;
  promptVersion: string;
  placement: string;
  motif: string;
};

const COLOURS = [
  {id: "charcoal", hex: "#1a1a1a", accent: "#c6f268"},
  {id: "bone", hex: "#f5f1e9", accent: "#131414"},
  {id: "cobalt", hex: "#1e3a8a", accent: "#f5f1e9"},
  {id: "cherry", hex: "#9f1239", accent: "#fef3c7"},
  {id: "sage", hex: "#4d7c5f", accent: "#f5f1e9"},
  {id: "rust", hex: "#b45309", accent: "#131414"},
  {id: "lavender", hex: "#7c6bae", accent: "#131414"},
  {id: "sand", hex: "#d6cbb8", accent: "#be614b"},
  {id: "teal", hex: "#0f766e", accent: "#fef9c3"},
  {id: "slate", hex: "#475569", accent: "#e2e8f0"},
  {id: "olive", hex: "#556b2f", accent: "#f5f1e9"},
  {id: "cream", hex: "#fffefa", accent: "#131414"},
  {id: "denim", hex: "#3d5a80", accent: "#f5f1e9"},
  {id: "plum", hex: "#5b2c6f", accent: "#f5d0fe"},
  {id: "mustard", hex: "#ca8a04", accent: "#131414"},
  {id: "forest", hex: "#14532d", accent: "#bbf7d0"},
  {id: "scarlet", hex: "#dc2626", accent: "#131414"},
  {id: "icy", hex: "#bae6fd", accent: "#0c4a6e"},
  {id: "terracotta", hex: "#c2410c", accent: "#fef3c7"},
  {id: "chocolate", hex: "#3f2e27", accent: "#d6cbb8"},
  {id: "cornflower", hex: "#60a5fa", accent: "#131414"},
  {id: "burgundy", hex: "#7f1d1d", accent: "#fecaca"},
  {id: "lime", hex: "#84cc16", accent: "#131414"},
  {id: "dusty-rose", hex: "#be8b8b", accent: "#131414"},
];

const TEE_CUTS = [
  "OVERSIZED",
  "BOXY",
  "REGULAR",
  "HEAVYWEIGHT",
  "LONGLINE",
  "RAGLAN",
  "CROP ADULT",
  "FITTED TRAINING",
  "SLEEVELESS GYM",
  "COLOUR-BLOCK",
  "VINTAGE WASH",
  "MINIMAL POCKET",
];

const PANT_CUTS = [
  "STRAIGHT TRACK",
  "CUFFED JOGGER",
  "BAGGY TRACK",
  "WIDE-LEG LOUNGE",
  "TAPERED TRAINING",
  "CARGO JOGGER",
  "SIDE-STRIPE",
  "OPEN-HEM",
  "FLEECE SWEAT",
  "PANELLED SPORT",
  "PARACHUTE",
  "COLLEGE LOUNGE",
];

const ART_STYLES = [
  "BOLD TYPE",
  "HAND LETTERED",
  "EDITORIAL CALLOGRAPHY",
  "GEOMETRIC",
  "LINEWORK",
  "VINTAGE COLLEGE",
  "STREET POSTER",
  "MINIMAL MARK",
  "BACK LARGE",
  "MOTIF PANEL",
];

const SCENES = ["studio-bone", "studio-charcoal", "gym", "campus", "urban", "loft-day", "court", "rooftop"];

function hash32(input: string): number {
  const h = createHash("sha256").update(input).digest();
  return h.readUInt32BE(0);
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[(seed + salt) % arr.length]!;
}

export function buildDesignDna(input: {
  slug: string;
  designBriefFingerprint: string;
  quoteFingerprint: string;
  quoteText: string;
  language?: string | null;
  garmentFamily?: string | null;
  placement?: string | null;
  motif?: string | null;
  fit?: string | null;
  palette?: string | null;
}): DesignDna {
  const seed = hash32(input.designBriefFingerprint);
  const garmentFamily = input.garmentFamily === "PANTS" ? "PANTS" : "TEES";
  const colour = pick(COLOURS, seed, 1);
  const garmentCut =
    garmentFamily === "PANTS"
      ? pick(PANT_CUTS, seed, 2)
      : pick(TEE_CUTS, seed, 3);
  const modelIdentityId = `VM-MODEL-${String((seed % 24) + 1).padStart(2, "0")}`;
  return {
    conceptId: input.slug,
    quoteFingerprint: input.quoteFingerprint,
    quoteText: input.quoteText,
    language: input.language ?? "en",
    garmentFamily,
    garmentCut,
    colourwayId: colour.id,
    colourHex: colour.hex,
    accentHex: colour.accent,
    artStyle: pick(ART_STYLES, seed, 5),
    modelIdentityId,
    sceneId: pick(SCENES, seed, 7),
    renderSeed: seed,
    promptVersion: "fashion-dna-v1",
    placement: input.placement ?? "CHEST",
    motif: input.motif ?? "ORIGINAL",
  };
}

export function visualApiPath(slug: string, view: "front" | "back" | "detail"): string {
  return `/api/catalog/visual/${encodeURIComponent(slug)}/${view}`;
}