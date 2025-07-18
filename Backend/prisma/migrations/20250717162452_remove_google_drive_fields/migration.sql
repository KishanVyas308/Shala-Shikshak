/*
  Warnings:

  - You are about to drop the column `solutionPdfFileId` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `textbookPdfFileId` on the `chapters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "solutionPdfFileId",
DROP COLUMN "textbookPdfFileId";
