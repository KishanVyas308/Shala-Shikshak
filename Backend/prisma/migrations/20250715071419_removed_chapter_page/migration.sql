/*
  Warnings:

  - You are about to drop the `chapter_page_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chapter_page_images" DROP CONSTRAINT "chapter_page_images_chapterId_fkey";

-- DropTable
DROP TABLE "chapter_page_images";
