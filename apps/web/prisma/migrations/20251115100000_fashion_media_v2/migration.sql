-- Fashion media traceability: product-specific previews vs shared templates
ALTER TABLE "ProductMediaV2" ADD COLUMN "visualKind" TEXT;
ALTER TABLE "ProductMediaV2" ADD COLUMN "contentSha256" TEXT;
ALTER TABLE "ProductMediaV2" ADD COLUMN "storefrontVisible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductMediaV2" ADD COLUMN "reviewState" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ProductMediaV2" ADD COLUMN "duplicateOfProductId" TEXT;

CREATE INDEX "ProductMediaV2_productId_storefrontVisible_idx" ON "ProductMediaV2"("productId", "storefrontVisible");
CREATE INDEX "ProductMediaV2_contentSha256_idx" ON "ProductMediaV2"("contentSha256");