-- AlterEnum
ALTER TYPE "RedemptionStatus" ADD VALUE 'USED';

-- DropForeignKey
ALTER TABLE "vouchers" DROP CONSTRAINT IF EXISTS "vouchers_merchantId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "vouchers_merchantId_idx";

-- AlterTable orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "finalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable voucher_redemptions
ALTER TABLE "voucher_redemptions" ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3);
ALTER TABLE "voucher_redemptions" ADD COLUMN IF NOT EXISTS "usedInOrderId" UUID;

-- AlterTable vouchers - drop merchantId
ALTER TABLE "vouchers" DROP COLUMN IF EXISTS "merchantId";
ALTER TABLE "vouchers" ADD COLUMN IF NOT EXISTS "discountAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "voucher_redemptions_usedInOrderId_key" ON "voucher_redemptions"("usedInOrderId");

-- AddForeignKey
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_usedInOrderId_fkey" FOREIGN KEY ("usedInOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;