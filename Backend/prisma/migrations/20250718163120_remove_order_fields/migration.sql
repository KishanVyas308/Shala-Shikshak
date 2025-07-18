/*
  Warnings:

  - You are about to drop the column `order` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `subjects` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "chapters_order_subjectId_key";

-- DropIndex
DROP INDEX "subjects_order_standardId_key";

-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "order";
