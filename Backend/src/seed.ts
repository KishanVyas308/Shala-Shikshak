import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminEmail = 'admin@shalashikshak.com';
  const adminPassword = 'admin123';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const admin = await prisma.admin.create({
      data: {
        name: 'Default Admin',
        email: adminEmail,
        password: hashedPassword,
      },
    });

    console.log('✅ Created default admin:', { id: admin.id, email: admin.email });
  } else {
    console.log('ℹ️  Default admin already exists');
  }

  // Create sample standards
  const standards = [
    { name: 'Class 1', description: 'First standard', order: 1 },
    { name: 'Class 2', description: 'Second standard', order: 2 },
    { name: 'Class 3', description: 'Third standard', order: 3 },
    { name: 'Class 4', description: 'Fourth standard', order: 4 },
    { name: 'Class 5', description: 'Fifth standard', order: 5 },
  ];

  for (const standardData of standards) {
    const existingStandard = await prisma.standard.findUnique({
      where: { name: standardData.name },
    });

    if (!existingStandard) {
      const standard = await prisma.standard.create({
        data: standardData,
      });
      console.log(`✅ Created standard: ${standard.name}`);

      // Create sample subjects for each standard
      const subjects = [
        { name: 'Mathematics', description: 'Math subject' },
        { name: 'Science', description: 'Science subject' },
        { name: 'English', description: 'English subject' },
      ];

      for (const subjectData of subjects) {
        const subject = await prisma.subject.create({
          data: {
            ...subjectData,
            standardId: standard.id,
          },
        });
        console.log(`  ✅ Created subject: ${subject.name} for ${standard.name}`);

        // Create sample chapters for each subject
        const chapters = [
          { 
            name: 'Introduction', 
            description: 'Introduction chapter',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          { 
            name: 'Basic Concepts', 
            description: 'Basic concepts chapter',
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ];

        for (const chapterData of chapters) {
          const chapter = await prisma.chapter.create({
            data: {
              ...chapterData,
              subjectId: subject.id,
            },
          });
          console.log(`    ✅ Created chapter: ${chapter.name}`);
        }
      }
    } else {
      console.log(`ℹ️  Standard ${standardData.name} already exists`);
    }
  }

  console.log('🎉 Database seed completed!');
  console.log('📧 Default admin credentials:');
  console.log('   Email: admin@shalashikshak.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
