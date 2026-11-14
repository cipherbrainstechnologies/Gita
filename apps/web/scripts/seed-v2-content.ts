/**
 * Seeds ContentSource / ContentPassage / ContentLocalization from data/v2 JSON.
 * Never marks scripture localizations as commercially approved.
 * Safe to re-run (upsert by sourceKey / passageKey / textHash).
 */
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

type GitaSeed = {
  id: string;
  work: string;
  chapterVerse: string;
  primaryLanguage: string;
  script: string;
  originalSanskrit: string;
  sourceUrl: string;
  sourceVerification: string;
  draftInterpretations: {en: string; hi: string; gu: string};
  publicationStatus: string;
};

type SloganSeed = {
  id: string;
  text: string;
  collection: string;
  theme: string;
};

function nfcHash(text: string): string {
  return createHash("sha256").update(text.normalize("NFC")).digest("hex");
}

async function main() {
  const root = resolve(__dirname, "..");
  const gita = JSON.parse(readFileSync(resolve(root, "data/v2/authentic_gita_seed.json"), "utf8")) as GitaSeed[];
  const slogans = JSON.parse(readFileSync(resolve(root, "data/v2/original_slogans_seed.json"), "utf8")) as SloganSeed[];
  const quarantine = JSON.parse(
    readFileSync(resolve(root, "data/v2/screenshot_quote_unverified.json"), "utf8"),
  ) as {id?: string; originalText?: string; text?: string};

  const gitaSource = await prisma.contentSource.upsert({
    where: {sourceKey: "bhagavad-gita-iitk-heritage"},
    create: {
      sourceKey: "bhagavad-gita-iitk-heritage",
      title: "Bhagavad Gita (IITK Heritage verse references)",
      category: "SCRIPTURE",
      authoritativeUrl: "https://heritage.iitk.ac.in/SBG/",
      rightsStatus: "PUBLIC_DOMAIN_SOURCE_REVIEWED",
    },
    update: {rightsStatus: "PUBLIC_DOMAIN_SOURCE_REVIEWED"},
  });

  for (const v of gita) {
    const hash = nfcHash(v.originalSanskrit);
    const passage = await prisma.contentPassage.upsert({
      where: {passageKey: v.id},
      create: {
        sourceId: gitaSource.id,
        passageKey: v.id,
        chapterVerse: v.chapterVerse,
        originalLanguage: v.primaryLanguage,
        originalScript: v.script,
        originalText: v.originalSanskrit,
        textHash: hash,
        sourceVerification: v.sourceVerification,
        publicationStatus: "EDITORIAL_REVIEW_REQUIRED",
      },
      update: {
        originalText: v.originalSanskrit,
        textHash: hash,
        sourceVerification: v.sourceVerification,
      },
    });

    for (const [locale, text] of Object.entries(v.draftInterpretations)) {
      await prisma.contentLocalization.upsert({
        where: {
          passageId_locale_format_revision: {
            passageId: passage.id,
            locale,
            format: "EXPLANATORY_PARAPHRASE",
            revision: 1,
          },
        },
        create: {
          passageId: passage.id,
          locale,
          translatedText: text,
          revision: 1,
          format: "EXPLANATORY_PARAPHRASE",
          rightsStatus: "REVIEW_REQUIRED",
          linguisticStatus: "NEEDS_NATIVE_REVIEW",
          culturalStatus: "NEEDS_CULTURAL_REVIEW",
        },
        update: {translatedText: text},
      });
    }
  }

  const originalSource = await prisma.contentSource.upsert({
    where: {sourceKey: "verse-mode-original-editorial"},
    create: {
      sourceKey: "verse-mode-original-editorial",
      title: "VERSE//MODE original editorial slogans",
      category: "ORIGINAL",
      rightsStatus: "BRAND_OWNED_DRAFT",
    },
    update: {},
  });

  for (const s of slogans) {
    const hash = nfcHash(s.text);
    await prisma.contentPassage.upsert({
      where: {passageKey: s.id},
      create: {
        sourceId: originalSource.id,
        passageKey: s.id,
        originalLanguage: "en",
        originalScript: "Latin",
        originalText: s.text,
        textHash: hash,
        sourceVerification: "BRAND_ORIGINAL",
        publicationStatus: "DRAFT",
      },
      update: {originalText: s.text, textHash: hash},
    });
  }

  // Quarantine unverified social screenshot — never scripture attribution.
  const quarantineText = quarantine?.originalText ?? quarantine?.text;
  if (quarantineText) {
    const qSource = await prisma.contentSource.upsert({
      where: {sourceKey: "unverified-social-quarantine"},
      create: {
        sourceKey: "unverified-social-quarantine",
        title: "Unverified social quotes (quarantine)",
        category: "UNVERIFIED_SOCIAL",
        rightsStatus: "FORBIDDEN_UNTIL_VERIFIED",
      },
      update: {},
    });
    const qKey = quarantine.id ?? "screenshot-quote-unverified";
    await prisma.contentPassage.upsert({
      where: {passageKey: qKey},
      create: {
        sourceId: qSource.id,
        passageKey: qKey,
        originalLanguage: "und",
        originalScript: "Unknown",
        originalText: quarantineText,
        textHash: nfcHash(quarantineText),
        sourceVerification: "UNVERIFIED",
        publicationStatus: "QUARANTINED",
      },
      update: {publicationStatus: "QUARANTINED"},
    });
  }

  console.log(
    JSON.stringify({
      ok: true,
      gitaPassages: gita.length,
      originalSlogans: slogans.length,
      quarantined: Boolean(quarantineText),
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
