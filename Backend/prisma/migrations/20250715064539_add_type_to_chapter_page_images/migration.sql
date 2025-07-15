/*
  Warnings:

  - A unique constraint covering the columns `[chapterId,type,page]` on the table `chapter_page_images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "chapter_page_images_chapterId_page_key";

-- AlterTable
ALTER TABLE "chapter_page_images" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'textbook';

-- CreateIndex
CREATE UNIQUE INDEX "chapter_page_images_chapterId_type_page_key" ON "chapter_page_images"("chapterId", "type", "page");
