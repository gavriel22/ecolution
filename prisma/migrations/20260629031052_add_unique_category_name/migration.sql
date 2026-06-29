/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `activity_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `challenge_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `voucher_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activity_categories_name_key" ON "activity_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_categories_name_key" ON "challenge_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_categories_name_key" ON "voucher_categories"("name");
