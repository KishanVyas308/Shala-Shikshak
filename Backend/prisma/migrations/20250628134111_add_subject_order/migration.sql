/*
  Warnings:

  - A unique constraint covering the columns `[order,standardId]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `subjects` table without a default value. This is not possible if the table is not empty.

*/
-- Add the order column with a default value first
ALTER TABLE "subjects" ADD COLUMN "order" INTEGER DEFAULT 1;

-- Update existing rows to have unique orders within each standard
UPDATE "subjects" SET "order" = sub.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "standardId" ORDER BY "createdAt") as row_number
  FROM "subjects"
) sub 
WHERE "subjects".id = sub.id;

-- Remove the default value now that all rows have been updated
ALTER TABLE "subjects" ALTER COLUMN "order" DROP DEFAULT;

-- Make the order column NOT NULL (it already has values now)
ALTER TABLE "subjects" ALTER COLUMN "order" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subjects_order_standardId_key" ON "subjects"("order", "standardId");
