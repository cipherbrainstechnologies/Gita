/**
 * Rights-reviewed in-repo reference inventory.
 * Count DISTINCT asset paths — never treat alias model IDs as unique humans.
 */

export type GarmentFamily = "TEES" | "PANTS";
export type ReferenceView = "front" | "back" | "side" | "detail" | "lifestyle";

export type SourceReference = {
  id: string;
  assetPath: string;
  garmentFamily: GarmentFamily;
  silhouette: string;
  view: ReferenceView;
  trueColour: string;
  adultConfirmed: true;
  licenseNote: string;
  publicationAllowed: boolean;
  /** Author-aligned mask quality for this exact photo. */
  maskStatus: "ALIGNED" | "NONE";
};

/** Only tee editorial photographs currently exist in-repo. */
export const SOURCE_REFERENCES: SourceReference[] = [
  {
    id: "REF-QP-FRONT",
    assetPath: "/images/quiet-power-editorial-front.webp",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "front",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Quiet Power front",
    publicationAllowed: true,
    maskStatus: "ALIGNED",
  },
  {
    id: "REF-QP-FRONT-JPG",
    assetPath: "/images/quiet-power-editorial-front.jpg",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "front",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Quiet Power front JPEG",
    publicationAllowed: true,
    maskStatus: "ALIGNED",
  },
  {
    id: "REF-QP-BACK",
    assetPath: "/images/quiet-power-editorial-back.webp",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "back",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Quiet Power back",
    publicationAllowed: true,
    maskStatus: "ALIGNED",
  },
  {
    id: "REF-QP-SIDE",
    assetPath: "/images/quiet-power-editorial-side.jpg",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "side",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Quiet Power side",
    publicationAllowed: true,
    maskStatus: "NONE",
  },
  {
    id: "REF-QP-DETAIL",
    assetPath: "/images/quiet-power-editorial-detail.webp",
    garmentFamily: "TEES",
    silhouette: "PRINT DETAIL",
    view: "detail",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Quiet Power detail",
    publicationAllowed: true,
    maskStatus: "NONE",
  },
  {
    id: "REF-KARMA-FRONT",
    assetPath: "/images/karma-editorial-front.webp",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "front",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Karma front",
    publicationAllowed: true,
    maskStatus: "ALIGNED",
  },
  {
    id: "REF-KARMA-BACK",
    assetPath: "/images/karma-editorial-back.webp",
    garmentFamily: "TEES",
    silhouette: "OVERSIZED CREW",
    view: "back",
    trueColour: "black",
    adultConfirmed: true,
    licenseNote: "VERSE editorial Karma back",
    publicationAllowed: true,
    maskStatus: "ALIGNED",
  },
];

export function distinctHumanSourcePhotoCount(): number {
  return new Set(
    SOURCE_REFERENCES.filter((r) => r.view === "front" || r.view === "back" || r.view === "side").map(
      (r) => r.assetPath,
    ),
  ).size;
}

export function sourceRefsForFamily(family: GarmentFamily): SourceReference[] {
  return SOURCE_REFERENCES.filter((r) => r.garmentFamily === family && r.publicationAllowed);
}

export function findSourceByPath(assetPath: string): SourceReference | undefined {
  return SOURCE_REFERENCES.find((r) => r.assetPath === assetPath);
}

export function pantsModelPhotoCount(): number {
  return sourceRefsForFamily("PANTS").length;
}
