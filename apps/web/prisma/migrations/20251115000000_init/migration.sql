-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('SUPERADMIN', 'MERCHANDISER', 'OPERATIONS', 'SUPPORT', 'FINANCE', 'DESIGNER', 'FRANCHISE_MANAGER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'NEEDS_CONFIGURATION');

-- CreateEnum
CREATE TYPE "DesignState" AS ENUM ('DRAFT', 'NEEDS_HUMAN_REVIEW', 'ORIGINALITY_REVIEW', 'PROOF_PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('CONCEPT', 'SAMPLE_PENDING', 'SAMPLE_APPROVED', 'PREORDER', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PAYMENT_PENDING', 'PAID', 'VENDOR_CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY_TO_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'AUTHORISED', 'CAPTURED', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PromotionKind" AS ENUM ('SEASONAL', 'CATEGORY', 'LAUNCH', 'PARTNER', 'BIRTHDAY', 'MANUAL');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "StaffRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "googleSubject" TEXT,
    "email" TEXT,
    "displayName" TEXT,
    "phoneEncrypted" TEXT,
    "dateOfBirthEncrypted" TEXT,
    "over18ConfirmedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerConsent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "consented" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence" JSONB,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteDraft" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "originType" TEXT NOT NULL,
    "sourceCitation" TEXT,
    "editorialStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignBrief" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "quoteFingerprint" TEXT NOT NULL,
    "quoteText" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "garmentFamily" TEXT NOT NULL,
    "artFamily" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "palette" TEXT NOT NULL,
    "fit" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignCandidate" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "designBriefId" TEXT,
    "quoteText" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "garmentFamily" TEXT NOT NULL,
    "artFamily" TEXT NOT NULL,
    "state" "DesignState" NOT NULL DEFAULT 'DRAFT',
    "semanticReview" JSONB,
    "similarityFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignVersion" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "promptVersion" TEXT,
    "modelName" TEXT,
    "modelLicense" TEXT,
    "outputLicense" TEXT,
    "quoteSource" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "approverId" TEXT,
    "assetHash" TEXT,
    "artworkAssetId" TEXT,
    "previewAssetId" TEXT,
    "techPack" JSONB,
    "supplierProofId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "assetType" TEXT NOT NULL,
    "provenance" JSONB,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "collection" TEXT,
    "tagline" TEXT,
    "palette" TEXT,
    "category" TEXT NOT NULL,
    "audienceFit" TEXT NOT NULL,
    "designVersionId" TEXT,
    "supplierId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'CONCEPT',
    "images" JSONB,
    "fabricComposition" TEXT,
    "gsm" INTEGER,
    "countryOfOrigin" TEXT,
    "hsnCode" TEXT,
    "disclosure" TEXT,
    "sampleApprovedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "fit" TEXT NOT NULL,
    "garmentMeasurements" JSONB,
    "mrpPaise" BIGINT NOT NULL,
    "pricePaise" BIGINT NOT NULL,
    "costPaise" BIGINT,
    "taxRateBasisPoints" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sellPaise" BIGINT NOT NULL,
    "previousPaise" BIGINT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "actorId" TEXT,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "agreementRef" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "address" JSONB,
    "qualityTerms" JSONB,
    "leadTimeDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreorderCapacity" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "shipWindowFrom" TIMESTAMP(3) NOT NULL,
    "shipWindowTo" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreorderCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotalPaise" BIGINT NOT NULL,
    "discountPaise" BIGINT NOT NULL DEFAULT 0,
    "shippingPaise" BIGINT NOT NULL DEFAULT 0,
    "taxPaise" BIGINT NOT NULL,
    "totalPaise" BIGINT NOT NULL,
    "addressEncrypted" TEXT NOT NULL,
    "legalSellerSnapshot" JSONB NOT NULL,
    "shippingPromise" JSONB NOT NULL,
    "acceptedPolicy" JSONB NOT NULL,
    "auditTrace" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "skuSnapshot" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPaise" BIGINT NOT NULL,
    "taxPaise" BIGINT NOT NULL,
    "discountPaise" BIGINT NOT NULL,
    "attributes" JSONB NOT NULL,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "amountPaise" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "payloadSha256" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "result" TEXT,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amountPaise" BIGINT NOT NULL,
    "providerRefundId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "decisionBy" TEXT,
    "secondApprovalBy" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courier" TEXT,
    "provider" TEXT NOT NULL,
    "shipmentProviderId" TEXT,
    "awb" TEXT,
    "status" TEXT NOT NULL,
    "trackingEvents" JSONB,
    "bookedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManufacturingBatch" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "orderLineIds" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "estimatedReady" TIMESTAMP(3),
    "actualReady" TIMESTAMP(3),
    "proofAssetId" TEXT,
    "defectsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManufacturingBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "PromotionKind" NOT NULL,
    "label" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "eligibility" JSONB NOT NULL,
    "discountRule" JSONB NOT NULL,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "maxRedemptions" INTEGER,
    "maxPerCustomer" INTEGER,
    "minOrderPaise" BIGINT,
    "marginFloorBasisPoints" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRedemption" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amountPaise" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalStock" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PhysicalStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storeType" TEXT NOT NULL,
    "legalOwner" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "gstin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FranchiseAgreement" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "partnerLegalName" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "agreementAssetId" TEXT,
    "commissionRule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FranchiseAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSOrder" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "saleLines" JSONB NOT NULL,
    "tenderSnapshots" JSONB NOT NULL,
    "totalPaise" BIGINT NOT NULL,
    "taxPaise" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "POSOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "orderId" TEXT,
    "eventType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "consentPurpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "idempotencyKey" TEXT NOT NULL,

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'SANDBOX',
    "maskedSuffix" TEXT,
    "encryptedPayload" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL,
    "lastTestStatus" TEXT,
    "lastTestAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" JSONB,
    "correlation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "contentSha" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approvedBy" TEXT,
    "effectiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCase" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedTo" TEXT,
    "complaintAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL,
    "hsn" TEXT NOT NULL,
    "productDescriptor" TEXT NOT NULL,
    "taxRateBasisPoints" INTEGER NOT NULL,
    "salePriceCeilingPaise" BIGINT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalIdempotency" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ExternalIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'web',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_googleSubject_key" ON "Customer"("googleSubject");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "CustomerConsent_customerId_purpose_idx" ON "CustomerConsent"("customerId", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteDraft_fingerprint_key" ON "QuoteDraft"("fingerprint");

-- CreateIndex
CREATE INDEX "QuoteDraft_language_theme_idx" ON "QuoteDraft"("language", "theme");

-- CreateIndex
CREATE UNIQUE INDEX "DesignBrief_fingerprint_key" ON "DesignBrief"("fingerprint");

-- CreateIndex
CREATE INDEX "DesignBrief_state_theme_idx" ON "DesignBrief"("state", "theme");

-- CreateIndex
CREATE UNIQUE INDEX "DesignCandidate_fingerprint_key" ON "DesignCandidate"("fingerprint");

-- CreateIndex
CREATE INDEX "DesignCandidate_state_idx" ON "DesignCandidate"("state");

-- CreateIndex
CREATE UNIQUE INDEX "DesignVersion_candidateId_revision_key" ON "DesignVersion"("candidateId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_sha256_idx" ON "MediaAsset"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_category_idx" ON "Product"("status", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "PriceHistory_variantId_startAt_idx" ON "PriceHistory"("variantId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreorderCapacity_variantId_supplierId_key" ON "PreorderCapacity"("variantId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_provider_providerEventId_key" ON "PaymentEvent"("provider", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_providerRefundId_key" ON "Refund"("providerRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentProviderId_key" ON "Shipment"("shipmentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_awb_key" ON "Shipment"("awb");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRedemption_promotionId_orderId_key" ON "PromotionRedemption"("promotionId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalStock_storeId_variantId_key" ON "PhysicalStock"("storeId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_storeId_eventType_referenceId_variantId_key" ON "StockLedger"("storeId", "eventType", "referenceId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "POSOrder_receiptNo_key" ON "POSOrder"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "POSOrder_idempotencyKey_key" ON "POSOrder"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_idempotencyKey_key" ON "NotificationOutbox"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationSetting_provider_key" ON "IntegrationSetting"("provider");

-- CreateIndex
CREATE INDEX "AuditLog_target_createdAt_idx" ON "AuditLog"("target", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobRun_idempotencyKey_key" ON "JobRun"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyType_version_key" ON "PolicyVersion"("policyType", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SupportCase_publicId_key" ON "SupportCase"("publicId");

-- CreateIndex
CREATE INDEX "TaxRule_hsn_effectiveFrom_idx" ON "TaxRule"("hsn", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIdempotency_operation_externalKey_key" ON "ExternalIdempotency"("operation", "externalKey");

-- CreateIndex
CREATE INDEX "WaitlistLead_productSlug_createdAt_idx" ON "WaitlistLead"("productSlug", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistLead_email_productSlug_key" ON "WaitlistLead"("email", "productSlug");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
