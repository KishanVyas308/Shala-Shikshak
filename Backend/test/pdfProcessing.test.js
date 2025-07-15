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
const pdfProcessor_1 = require("../src/services/pdfProcessor");
const prisma_1 = require("../src/lib/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function testPDFProcessing() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing PDF Processing...');
        try {
            // Create a test chapter
            const testChapter = yield prisma_1.prisma.chapter.create({
                data: {
                    name: 'Test Chapter',
                    description: 'Test chapter for PDF processing',
                    order: 999,
                    subjectId: 'test-subject-id', // Replace with actual subject ID
                }
            });
            console.log('✅ Test chapter created:', testChapter.id);
            // Test PDF path - you'll need to provide an actual PDF file
            const testPDFPath = path_1.default.join(__dirname, 'test-sample.pdf');
            if (!fs_1.default.existsSync(testPDFPath)) {
                console.log('❌ Test PDF file not found. Please place a PDF file at:', testPDFPath);
                return;
            }
            // Process PDF
            console.log('📄 Processing PDF...');
            const convertedPages = yield pdfProcessor_1.PDFProcessor.processPDF(testPDFPath, testChapter.id, (current, total) => {
                console.log(`📊 Progress: ${current}/${total} pages processed`);
            });
            console.log('✅ PDF processed successfully!');
            console.log(`📚 Total pages: ${convertedPages.length}`);
            // Test signed URL generation
            if (convertedPages.length > 0) {
                const signedUrl = pdfProcessor_1.PDFProcessor.generateSignedUrl(convertedPages[0].imageUrl);
                console.log('🔐 Signed URL generated:', signedUrl);
                // Test URL validation
                const url = new URL(signedUrl, 'http://localhost:5000');
                const token = url.searchParams.get('token');
                const exp = url.searchParams.get('exp');
                if (token && exp) {
                    const isValid = pdfProcessor_1.PDFProcessor.validateSignedUrl(convertedPages[0].imageUrl, token, exp);
                    console.log('✅ URL validation:', isValid ? 'Valid' : 'Invalid');
                }
            }
            // Test database queries
            const pageImages = yield prisma_1.prisma.chapterPageImage.findMany({
                where: { chapterId: testChapter.id },
                orderBy: { page: 'asc' }
            });
            console.log('📊 Database records:');
            pageImages.forEach(page => {
                console.log(`  Page ${page.page}: ${page.imageUrl} (${page.fileSize} bytes)`);
            });
            // Cleanup
            console.log('🧹 Cleaning up...');
            yield pdfProcessor_1.PDFProcessor.deleteChapterImages(testChapter.id);
            yield prisma_1.prisma.chapter.delete({ where: { id: testChapter.id } });
            console.log('✅ Test completed successfully!');
        }
        catch (error) {
            console.error('❌ Test failed:', error);
        }
    });
}
// Test watermarking
function testWatermarking() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🎨 Testing Watermarking...');
        try {
            const testImagePath = path_1.default.join(__dirname, 'test-image.png');
            const outputPath = path_1.default.join(__dirname, 'watermarked-image.webp');
            if (!fs_1.default.existsSync(testImagePath)) {
                console.log('❌ Test image not found. Please place an image at:', testImagePath);
                return;
            }
            yield pdfProcessor_1.PDFProcessor.addWatermark(testImagePath, 'Shala Shikshak - Confidential', outputPath);
            console.log('✅ Watermark added successfully!');
            console.log('💾 Output saved to:', outputPath);
        }
        catch (error) {
            console.error('❌ Watermarking test failed:', error);
        }
    });
}
// Test file utilities
function testUtilities() {
    console.log('🔧 Testing Utilities...');
    // Test signed URL generation and validation
    const testUrl = '/uploads/chapters/test/page-1.webp';
    const signedUrl = pdfProcessor_1.PDFProcessor.generateSignedUrl(testUrl, 3600);
    console.log('🔐 Generated signed URL:', signedUrl);
    const url = new URL(signedUrl, 'http://localhost:5000');
    const token = url.searchParams.get('token');
    const exp = url.searchParams.get('exp');
    if (token && exp) {
        const isValid = pdfProcessor_1.PDFProcessor.validateSignedUrl(testUrl, token, exp);
        console.log('✅ URL validation result:', isValid);
    }
    // Test expired URL
    const expiredUrl = pdfProcessor_1.PDFProcessor.generateSignedUrl(testUrl, -1); // Already expired
    const expiredUrlObj = new URL(expiredUrl, 'http://localhost:5000');
    const expiredToken = expiredUrlObj.searchParams.get('token');
    const expiredExp = expiredUrlObj.searchParams.get('exp');
    if (expiredToken && expiredExp) {
        const isExpiredValid = pdfProcessor_1.PDFProcessor.validateSignedUrl(testUrl, expiredToken, expiredExp);
        console.log('❌ Expired URL validation (should be false):', isExpiredValid);
    }
    console.log('✅ Utilities test completed!');
}
// Run tests
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Starting PDF Processing Tests...\n');
        testUtilities();
        yield testWatermarking();
        yield testPDFProcessing();
        console.log('\n🎉 All tests completed!');
        process.exit(0);
    });
}
// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
if (require.main === module) {
    runTests();
}
