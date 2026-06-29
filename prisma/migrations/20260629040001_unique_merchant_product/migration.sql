/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `merchants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantId,name]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "MerchantStatus" ADD VALUE 'APPROVED';

-- CreateIndex
CREATE UNIQUE INDEX "merchants_ownerId_key" ON "merchants"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "products_merchantId_name_key" ON "products"("merchantId", "name");
