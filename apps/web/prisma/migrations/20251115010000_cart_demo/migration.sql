-- AlterTable: additive, nullable columns on NotificationOutbox (safe for existing rows)
ALTER TABLE "NotificationOutbox" ADD COLUMN "destination" TEXT,
ADD COLUMN "payload" JSONB;

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartItem_customerId_updatedAt_idx" ON "CartItem"("customerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_customerId_productSlug_size_key" ON "CartItem"("customerId", "productSlug", "size");
