-- V2 content provenance, multilingual approvals, tech packs and media proof gate.
-- Safe additive migration — does not alter DemoCredential / CartItem / WaitlistLead.

CREATE TABLE IF NOT EXISTS "ContentSource" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authoritativeUrl" TEXT,
    "rightsEvidenceUrl" TEXT,
    "rightsStatus" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "licensedUntil" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentSource_sourceKey_key" ON "ContentSource"("sourceKey");
CREATE INDEX IF NOT EXISTS "ContentSource_category_rightsStatus_idx" ON "ContentSource"("category", "rightsStatus");

CREATE TABLE IF NOT EXISTS "ContentPassage" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "passageKey" TEXT NOT NULL,
    "chapterVerse" TEXT,
    "originalLanguage" TEXT NOT NULL,
    "originalScript" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "sourceVerification" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "similarityVectorId" TEXT,
    "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentPassage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentPassage_passageKey_key" ON "ContentPassage"("passageKey");
CREATE UNIQUE INDEX IF NOT EXISTS "ContentPassage_textHash_key" ON "ContentPassage"("textHash");
CREATE INDEX IF NOT EXISTS "ContentPassage_sourceId_publicationStatus_idx" ON "ContentPassage"("sourceId", "publicationStatus");

CREATE TABLE IF NOT EXISTS "ContentLocalization" (
    "id" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "format" TEXT NOT NULL,
    "sourceTranslator" TEXT,
    "rightsStatus" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "linguisticStatus" TEXT NOT NULL DEFAULT 'NEEDS_NATIVE_REVIEW',
    "culturalStatus" TEXT NOT NULL DEFAULT 'NEEDS_CULTURAL_REVIEW',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentLocalization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentLocalization_passageId_locale_format_revision_key"
  ON "ContentLocalization"("passageId", "locale", "format", "revision");
CREATE INDEX IF NOT EXISTS "ContentLocalization_linguisticStatus_culturalStatus_idx"
  ON "ContentLocalization"("linguisticStatus", "culturalStatus");

CREATE TABLE IF NOT EXISTS "ApparelTechPack" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "manufacturerId" TEXT,
    "fit" TEXT NOT NULL,
    "fabricComposition" TEXT,
    "fabricGsm" INTEGER,
    "knittingType" TEXT,
    "finish" TEXT,
    "colourfastnessGrade" TEXT,
    "washShrinkagePct" DECIMAL(5,2),
    "measurementSpec" JSONB,
    "printTechnique" TEXT,
    "printAreaMm" JSONB,
    "artAssetHash" TEXT,
    "washCare" JSONB,
    "sampleSignoffAt" TIMESTAMP(3),
    "signedOffBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApparelTechPack_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ApparelTechPack_productId_version_key" ON "ApparelTechPack"("productId", "version");

CREATE TABLE IF NOT EXISTS "ProductMediaV2" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "designVersionId" TEXT,
    "mediaRole" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "assetSha256" TEXT NOT NULL,
    "artworkRevision" INTEGER,
    "visualReviewedBy" TEXT,
    "visualReviewedAt" TIMESTAMP(3),
    "verifiedAgainstSample" BOOLEAN NOT NULL DEFAULT false,
    "approvedForPublication" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductMediaV2_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductMediaV2_productId_mediaRole_assetSha256_key"
  ON "ProductMediaV2"("productId", "mediaRole", "assetSha256");
CREATE INDEX IF NOT EXISTS "ProductMediaV2_productId_approvedForPublication_idx"
  ON "ProductMediaV2"("productId", "approvedForPublication");

CREATE TABLE IF NOT EXISTS "ContentApprovalAudit" (
    "id" TEXT NOT NULL,
    "passageId" TEXT,
    "productId" TEXT,
    "designId" TEXT,
    "stage" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "note" TEXT,
    "evidenceHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentApprovalAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContentApprovalAudit_productId_createdAt_idx"
  ON "ContentApprovalAudit"("productId", "createdAt");
