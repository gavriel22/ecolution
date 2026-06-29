/*
  Warnings:

  - You are about to drop the column `voucherCode` on the `vouchers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vouchers_voucherCode_key";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "location" VARCHAR(255);

-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "imageUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "note" TEXT,
ADD COLUMN     "orderNumber" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "imageThumbnail" VARCHAR(255);

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "voucherCode";

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "deviceName" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_isRevoked_idx" ON "refresh_tokens"("isRevoked");

-- CreateIndex
CREATE INDEX "merchants_businessName_idx" ON "merchants"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "vouchers_expiredAt_idx" ON "vouchers"("expiredAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
