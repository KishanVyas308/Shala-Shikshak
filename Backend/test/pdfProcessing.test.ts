import { PDFProcessor } from '../src/services/pdfProcessor';
import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function testPDFProcessing() {
  console.log('🧪 Testing PDF Processing...');

  try {
    // Create a test chapter
    const testChapter = await prisma.chapter.create({
      data: {
        name: 'Test Chapter',
        description: 'Test chapter for PDF processing',
        order: 999,
        subjectId: 'test-subject-id', // Replace with actual subject ID
      }
    });

    console.log('✅ Test chapter created:', testChapter.id);

    // Test PDF path - you'll need to provide an actual PDF file
    const testPDFPath = path.join(__dirname, 'test-sample.pdf');
    
    if (!fs.existsSync(testPDFPath)) {
      console.log('❌ Test PDF file not found. Please place a PDF file at:', testPDFPath);
      return;
    }

    // Process PDF
    console.log('📄 Processing PDF...');
    const convertedPages = await PDFProcessor.processPDF(
      testPDFPath,
      testChapter.id,
      (current, total) => {
        console.log(`📊 Progress: ${current}/${total} pages processed`);
      }
    );

    console.log('✅ PDF processed successfully!');
    console.log(`📚 Total pages: ${convertedPages.length}`);

    // Test signed URL generation
    if (convertedPages.length > 0) {
      const signedUrl = PDFProcessor.generateSignedUrl(convertedPages[0].imageUrl);
      console.log('🔐 Signed URL generated:', signedUrl);

      // Test URL validation
      const url = new URL(signedUrl, 'http://localhost:5000');
      const token = url.searchParams.get('token');
      const exp = url.searchParams.get('exp');
      
      if (token && exp) {
        const isValid = PDFProcessor.validateSignedUrl(
          convertedPages[0].imageUrl,
          token,
          exp
        );
        console.log('✅ URL validation:', isValid ? 'Valid' : 'Invalid');
      }
    }

    // Test database queries
    const pageImages = await prisma.chapterPageImage.findMany({
      where: { chapterId: testChapter.id },
      orderBy: { page: 'asc' }
    });

    console.log('📊 Database records:');
    pageImages.forEach(page => {
      console.log(`  Page ${page.page}: ${page.imageUrl} (${page.fileSize} bytes)`);
    });

    // Cleanup
    console.log('🧹 Cleaning up...');
    await PDFProcessor.deleteChapterImages(testChapter.id);
    await prisma.chapter.delete({ where: { id: testChapter.id } });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test watermarking
async function testWatermarking() {
  console.log('🎨 Testing Watermarking...');

  try {
    const testImagePath = path.join(__dirname, 'test-image.png');
    const outputPath = path.join(__dirname, 'watermarked-image.webp');

    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found. Please place an image at:', testImagePath);
      return;
    }

    await PDFProcessor.addWatermark(
      testImagePath,
      'Shala Shikshak - Confidential',
      outputPath
    );

    console.log('✅ Watermark added successfully!');
    console.log('💾 Output saved to:', outputPath);

  } catch (error) {
    console.error('❌ Watermarking test failed:', error);
  }
}

// Test file utilities
function testUtilities() {
  console.log('🔧 Testing Utilities...');

  // Test signed URL generation and validation
  const testUrl = '/uploads/chapters/test/page-1.webp';
  const signedUrl = PDFProcessor.generateSignedUrl(testUrl, 3600);
  console.log('🔐 Generated signed URL:', signedUrl);

  const url = new URL(signedUrl, 'http://localhost:5000');
  const token = url.searchParams.get('token');
  const exp = url.searchParams.get('exp');

  if (token && exp) {
    const isValid = PDFProcessor.validateSignedUrl(testUrl, token, exp);
    console.log('✅ URL validation result:', isValid);
  }

  // Test expired URL
  const expiredUrl = PDFProcessor.generateSignedUrl(testUrl, -1); // Already expired
  const expiredUrlObj = new URL(expiredUrl, 'http://localhost:5000');
  const expiredToken = expiredUrlObj.searchParams.get('token');
  const expiredExp = expiredUrlObj.searchParams.get('exp');

  if (expiredToken && expiredExp) {
    const isExpiredValid = PDFProcessor.validateSignedUrl(testUrl, expiredToken, expiredExp);
    console.log('❌ Expired URL validation (should be false):', isExpiredValid);
  }

  console.log('✅ Utilities test completed!');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting PDF Processing Tests...\n');

  testUtilities();
  await testWatermarking();
  await testPDFProcessing();

  console.log('\n🎉 All tests completed!');
  process.exit(0);
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
