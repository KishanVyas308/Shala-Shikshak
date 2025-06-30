"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting database seed...');
        // Create default admin user
        const adminEmail = 'admin@shalashikshak.com';
        const adminPassword = 'admin123';
        // Check if admin already exists
        const existingAdmin = yield prisma_1.prisma.admin.findUnique({
            where: { email: adminEmail },
        });
        if (!existingAdmin) {
            const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 12);
            const admin = yield prisma_1.prisma.admin.create({
                data: {
                    name: 'Default Admin',
                    email: adminEmail,
                    password: hashedPassword,
                },
            });
            console.log('✅ Created default admin:', { id: admin.id, email: admin.email });
        }
        else {
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
            const existingStandard = yield prisma_1.prisma.standard.findUnique({
                where: { name: standardData.name },
            });
            if (!existingStandard) {
                const standard = yield prisma_1.prisma.standard.create({
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
                    const subject = yield prisma_1.prisma.subject.create({
                        data: Object.assign(Object.assign({}, subjectData), { standardId: standard.id }),
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
                        const chapter = yield prisma_1.prisma.chapter.create({
                            data: Object.assign(Object.assign({}, chapterData), { subjectId: subject.id }),
                        });
                        console.log(`    ✅ Created chapter: ${chapter.name}`);
                    }
                }
            }
            else {
                console.log(`ℹ️  Standard ${standardData.name} already exists`);
            }
        }
        console.log('🎉 Database seed completed!');
        console.log('📧 Default admin credentials:');
        console.log('   Email: admin@shalashikshak.com');
        console.log('   Password: admin123');
    });
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.$disconnect();
}));
