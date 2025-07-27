/*
  Warnings:

  - You are about to drop the column `solutionPdfFileName` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `solutionPdfUrl` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `textbookPdfFileName` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `textbookPdfUrl` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `chapters` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChapterResourceType" AS ENUM ('svadhyay', 'svadhyay_pothi', 'other');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('video', 'pdf');

-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "solutionPdfFileName",
DROP COLUMN "solutionPdfUrl",
DROP COLUMN "textbookPdfFileName",
DROP COLUMN "textbookPdfUrl",
DROP COLUMN "videoUrl";

-- CreateTable
CREATE TABLE "chapter_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChapterResourceType" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapter_resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chapter_resources" ADD CONSTRAINT "chapter_resources_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
