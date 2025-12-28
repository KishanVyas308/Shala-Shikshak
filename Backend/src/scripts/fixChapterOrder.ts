import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixChapterOrder() {
  try {


    // Get all subjects
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          orderBy: { createdAt: 'asc' }, // Order by creation date
        },
      },
    });



    let totalUpdated = 0;

    // For each subject, update chapter order
    for (const subject of subjects) {
      if (subject.chapters.length === 0) continue;

  
      // Update each chapter with its new order
      for (let i = 0; i < subject.chapters.length; i++) {
        const chapter = subject.chapters[i];
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { order: i },
        });
        totalUpdated++;
      }
    }

  } catch (error) {
    console.error('Error fixing chapter order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixChapterOrder();
