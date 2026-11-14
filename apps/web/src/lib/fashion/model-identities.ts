/** Licensed in-repo editorial references — expand with commissioned shoots for full 24 unique faces. */
export type ModelIdentity = {
  id: string;
  displayName: string;
  genderPresentation: "female" | "male" | "neutral";
  frontAsset: string;
  backAsset: string;
  lifestyleAsset?: string;
  licenseNote: string;
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

/** 24 deterministic adult model slots — SKU DNA picks `modelIdentityId`. */
export const MODEL_IDENTITIES: ModelIdentity[] = [
  {id: "VM-MODEL-01", displayName: "Aanya", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A"},
  {id: "VM-MODEL-02", displayName: "Mira", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-03", displayName: "Sasha", genderPresentation: "female", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, lifestyleAsset: ED.qpSide, licenseNote: "VERSE editorial set A alt"},
  {id: "VM-MODEL-04", displayName: "Rhea", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-05", displayName: "Noah", genderPresentation: "male", frontAsset: ED.qpSide, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A pants"},
  {id: "VM-MODEL-06", displayName: "Arjun", genderPresentation: "male", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-07", displayName: "Leo", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, lifestyleAsset: ED.qpSide, licenseNote: "VERSE editorial set A"},
  {id: "VM-MODEL-08", displayName: "Dev", genderPresentation: "male", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt"},
  {id: "VM-MODEL-09", displayName: "Isha", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial cross"},
  {id: "VM-MODEL-10", displayName: "Tara", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial cross"},
  {id: "VM-MODEL-11", displayName: "Zoe", genderPresentation: "neutral", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A"},
  {id: "VM-MODEL-12", displayName: "Kai", genderPresentation: "neutral", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-13", displayName: "Nia", genderPresentation: "female", frontAsset: ED.qpFrontJpg, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A alt"},
  {id: "VM-MODEL-14", displayName: "Priya", genderPresentation: "female", frontAsset: ED.qpSide, backAsset: ED.qpBack, licenseNote: "VERSE editorial pants"},
  {id: "VM-MODEL-15", displayName: "Evan", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial cross"},
  {id: "VM-MODEL-16", displayName: "Ravi", genderPresentation: "male", frontAsset: ED.karmaFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial cross"},
  {id: "VM-MODEL-17", displayName: "Maya", genderPresentation: "female", frontAsset: ED.qpDetail, backAsset: ED.qpBack, licenseNote: "VERSE editorial detail crop"},
  {id: "VM-MODEL-18", displayName: "Jon", genderPresentation: "male", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A"},
  {id: "VM-MODEL-19", displayName: "Sam", genderPresentation: "neutral", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-20", displayName: "Lila", genderPresentation: "female", frontAsset: ED.qpFront, backAsset: ED.qpBack, licenseNote: "VERSE editorial set A"},
  {id: "VM-MODEL-21", displayName: "Omar", genderPresentation: "male", frontAsset: ED.qpSide, backAsset: ED.qpBack, licenseNote: "VERSE editorial pants"},
  {id: "VM-MODEL-22", displayName: "Ada", genderPresentation: "female", frontAsset: ED.karmaFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial set B"},
  {id: "VM-MODEL-23", displayName: "Vik", genderPresentation: "male", frontAsset: ED.qpFrontJpg, backAsset: ED.karmaBack, licenseNote: "VERSE editorial cross"},
  {id: "VM-MODEL-24", displayName: "Remy", genderPresentation: "neutral", frontAsset: ED.qpFront, backAsset: ED.karmaBack, licenseNote: "VERSE editorial cross"},
];

export function getModelIdentity(id: string): ModelIdentity {
  return MODEL_IDENTITIES.find((m) => m.id === id) ?? MODEL_IDENTITIES[0]!;
}

export function uniqueModelIdsUsed(ids: string[]): number {
  return new Set(ids).size;
}