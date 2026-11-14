/** Merchandising collections — creative taxonomy, not stock pools. */
export type MerchCollection = {
  key: string;
  name: string;
  blurb: string;
  sourceClasses: string[];
};

export const MERCH_COLLECTIONS: MerchCollection[] = [
  {
    key: "gita-code",
    name: "GITA//CODE",
    blurb: "Source-cited Sanskrit passages with original modern interpretations — never fabricated scripture.",
    sourceClasses: ["SCRIPTURE_SOURCE", "SCRIPTURE_INSPIRED_ORIGINAL"],
  },
  {
    key: "no-excuses",
    name: "NO EXCUSES",
    blurb: "Gym culture, discipline and habit design — original editorial lines only.",
    sourceClasses: ["ORIGINAL_EDITORIAL"],
  },
  {
    key: "campus-chaos",
    name: "CAMPUS CHAOS",
    blurb: "College life, friendship and offline identity — original writing.",
    sourceClasses: ["ORIGINAL_EDITORIAL"],
  },
  {
    key: "the-next-arc",
    name: "THE NEXT ARC",
    blurb: "Story-driven original lines inspired by anime/movie *themes* without unlicensed dialogue or characters.",
    sourceClasses: ["ORIGINAL_EDITORIAL", "LICENSED_POP_CULTURE"],
  },
  {
    key: "world-words",
    name: "WORLD//WORDS",
    blurb: "Multilingual editorial drops after native linguistic and cultural review.",
    sourceClasses: ["ORIGINAL_EDITORIAL", "SCRIPTURE_INSPIRED_ORIGINAL"],
  },
  {
    key: "cinema-state",
    name: "CINEMA//STATE",
    blurb: "Licensed pop culture only when territorial merchandise rights exist; otherwise original alternatives.",
    sourceClasses: ["LICENSED_POP_CULTURE"],
  },
];
