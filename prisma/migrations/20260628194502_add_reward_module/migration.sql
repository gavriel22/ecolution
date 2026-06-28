-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('VOUCHER', 'MERCHANDISE', 'DONATION', 'CASHBACK');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "reward_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "type" "RewardType" NOT NULL,
    "pointCost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "imageUrl" VARCHAR(255),
    "status" "RewardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" UUID NOT NULL,
    "rewardId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "pointUsed" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "redemptionCode" VARCHAR(50),
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reward_categories_name_idx" ON "reward_categories"("name");

-- CreateIndex
CREATE INDEX "rewards_categoryId_idx" ON "rewards"("categoryId");

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- CreateIndex
CREATE INDEX "rewards_status_idx" ON "rewards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reward_redemptions_redemptionCode_key" ON "reward_redemptions"("redemptionCode");

-- CreateIndex
CREATE INDEX "reward_redemptions_userId_idx" ON "reward_redemptions"("userId");

-- CreateIndex
CREATE INDEX "reward_redemptions_rewardId_idx" ON "reward_redemptions"("rewardId");

-- CreateIndex
CREATE INDEX "reward_redemptions_status_idx" ON "reward_redemptions"("status");

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "reward_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
