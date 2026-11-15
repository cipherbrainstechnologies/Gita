import {
  distinctHumanSourcePhotoCount,
  pantsModelPhotoCount,
  sourceRefsForFamily,
} from "./source-reference-library";

/** Licensed in-repo editorial references — IDs are assignment slots, NOT unique humans. */
export type ModelIdentity = {
  id: string;
  displayName: string;
  genderPresentation: "female" | "male" | "neutral";
  frontAsset: string;
  backAsset: string;
  lifestyleAsset?: string;
  licenseNote: string;
  /** Only TEES have on-model photos today. */
  garmentFamilies: Array<"TEES" | "PANTS">;
  presentation: "ON_MODEL" | "FLATLAY";
  sourcePhotoKey: string;
};

const ED = {
  qpFront: "/images/quiet-power-editorial-front.webp",
  qpBack: "/images/quiet-power-editorial-back.webp",
  qpSide: "/images/quiet-power-editorial-side.jpg",
  qpDetail: "/images/quiet-power-editorial-detail.webp",
  karmaFront: "/images/karma-editorial-front.webp",
  karmaBack: "/images/karma-editorial-back.webp",
  qpFrontJpg: "/images/quiet-power-editorial-front.jpg",
};

/**
 * Assignment slots for deterministic DNA. Multiple slots share the same sourcePhotoKey.
 * Honest diversity = distinct `sourcePhotoKey` / `distinctHumanSourcePhotoCount()`.
 */
export const MODEL_IDENTITIES: ModelIdentity[] = [
  {id: "VM-MODEL-01", displayName: "Aanya", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-02", displayName: "Mira", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-03", displayName: "Sasha", genderPresentation: "female", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, lifestyleAsset: ED.qpSide, licenseNote: "VERSE editorial set A alt", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front-jpg"},
  {id: "VM-MODEL-04", displayName: "Rhea", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-05", displayName: "Noah", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-06", displayName: "Arjun", genderPresentation: "male", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-07", displayName: "Leo", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, lifestyleAsset: ED.qpSide, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-08", displayName: "Dev", genderPresentation: "male", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front-jpg"},
  {id: "VM-MODEL-09", displayName: "Isha", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-10", displayName: "Tara", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-11", displayName: "Zoe", genderPresentation: "neutral", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-12", displayName: "Kai", genderPresentation: "neutral", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-13", displayName: "Nia", genderPresentation: "female", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front-jpg"},
  {id: "VM-MODEL-14", displayName: "Priya", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-15", displayName: "Evan", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-16", displayName: "Ravi", genderPresentation: "male", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-17", displayName: "Maya", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-18", displayName: "Jon", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-19", displayName: "Sam", genderPresentation: "neutral", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-20", displayName: "Lila", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
  {id: "VM-MODEL-21", displayName: "Omar", genderPresentation: "male", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front-jpg"},
  {id: "VM-MODEL-22", displayName: "Ada", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "karma-front"},
  {id: "VM-MODEL-23", displayName: "Vik", genderPresentation: "male", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front-jpg"},
  {id: "VM-MODEL-24", displayName: "Remy", genderPresentation: "neutral", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A", garmentFamilies: ["TEES"], presentation: "ON_MODEL", sourcePhotoKey: "qp-front"},
];

export function getModelIdentity(id: string): ModelIdentity {
  return MODEL_IDENTITIES.find((m) => m.id === id) ?? MODEL_IDENTITIES[0]!;
}

/** Slot alias count — do NOT report this as unique models. */
export function uniqueModelIdsUsed(ids: string[]): number {
  return new Set(ids).size;
}

export function distinctSourcePhotosUsed(ids: string[]): number {
  const keys = ids.map((id) => getModelIdentity(id).sourcePhotoKey);
  return new Set(keys).size;
}

export function pickModelIdentityId(seed: number, garmentFamily: "TEES" | "PANTS"): string {
  if (garmentFamily === "PANTS") {
    // No pants on-model identities — DNA still stores a stable slot for provenance.
    return `VM-MODEL-${String((seed % 24) + 1).padStart(2, "0")}`;
  }
  const teeSlots = MODEL_IDENTITIES.filter((m) => m.garmentFamilies.includes("TEES"));
  return teeSlots[(seed + 11) % teeSlots.length]!.id;
}

export function reportSourceDiversity(): {
  assignmentSlots: number;
  distinctHumanSourcePhotos: number;
  pantsOnModelPhotos: number;
  teeSourceRefs: number;
} {
  return {
    assignmentSlots: MODEL_IDENTITIES.length,
    distinctHumanSourcePhotos: distinctHumanSourcePhotoCount(),
    pantsOnModelPhotos: pantsModelPhotoCount(),
    teeSourceRefs: sourceRefsForFamily("TEES").length,
  };
}
