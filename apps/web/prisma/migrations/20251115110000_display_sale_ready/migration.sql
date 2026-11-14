ALTER TABLE "Product" ADD COLUMN "displaySaleReady" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Product_displaySaleReady_status_idx" ON "Product"("displaySaleReady", "status");