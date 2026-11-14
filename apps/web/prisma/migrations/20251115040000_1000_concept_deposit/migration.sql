-- CreateEnum
CREATE TYPE "PaymentIntentType" AS ENUM ('DEPOSIT', 'BALANCE', 'FULL');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RESERVATION_PENDING';
ALTER TYPE "OrderStatus" ADD VALUE 'DEPOSIT_PAID';
ALTER TYPE "OrderStatus" ADD VALUE 'BALANCE_PENDING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "designBriefFingerprint" TEXT,
ADD COLUMN "quoteFingerprint" TEXT,
ADD COLUMN "theme" TEXT,
ADD COLUMN "language" TEXT DEFAULT 'en',
ADD COLUMN "garmentFamily" TEXT,
ADD COLUMN "placement" TEXT,
ADD COLUMN "artFamily" TEXT,
ADD COLUMN "conceptMeta" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "chargeDuePaise" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN "depositDuePaise" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN "balanceDuePaise" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN "depositPaidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "intentType" "PaymentIntentType" NOT NULL DEFAULT 'FULL';

-- CreateTable
CREATE TABLE "DepositPolicy" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "flatDepositPaise" BIGINT NOT NULL DEFAULT 9900,
    "maxDepositPercentBps" INTEGER NOT NULL DEFAULT 2500,
    "pauseDepositCheckout" BOOLEAN NOT NULL DEFAULT true,
    "balanceDueDays" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "DepositPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_designBriefFingerprint_key" ON "Product"("designBriefFingerprint");

-- CreateIndex
CREATE INDEX "Product_theme_category_idx" ON "Product"("theme", "category");

-- CreateIndex
CREATE INDEX "Product_quoteFingerprint_idx" ON "Product"("quoteFingerprint");