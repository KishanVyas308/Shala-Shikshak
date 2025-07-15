/*
  Warnings:

  - You are about to drop the column `type` on the `chapter_page_images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chapterId,page]` on the table `chapter_page_images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "chapter_page_images_chapterId_type_page_key";

-- AlterTable
ALTER TABLE "chapter_page_images" DROP COLUMN "type";

-- CreateIndex
CREATE UNIQUE INDEX "chapter_page_images_chapterId_page_key" ON "chapter_page_images"("chapterId", "page");
