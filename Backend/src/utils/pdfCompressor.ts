import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export interface CompressionOptions {
  quality?: 'screen' | 'ebook' | 'printer' | 'prepress';
  compatibilityLevel?: '1.3' | '1.4' | '1.5' | '1.6' | '1.7';
}

/**
 * Compresses a PDF file using Ghostscript
 * @param inputPath - Absolute path to the input PDF file
 * @param outputPath - Absolute path for the compressed PDF output
 * @param options - Compression options
 * @returns Promise<{ success: boolean, originalSize: number, compressedSize: number, compressionRatio: number }>
 */
export async function compressPDF(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions = {}
): Promise<{
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}> {
  const { quality = 'ebook', compatibilityLevel = '1.4' } = options;

  try {
    // Validate input file exists
    if (!existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Sanitize paths to prevent injection
    const sanitizedInputPath = path.normalize(inputPath);
    const sanitizedOutputPath = path.normalize(outputPath);

    // Validate paths are absolute and don't contain dangerous patterns
    if (!path.isAbsolute(sanitizedInputPath) || !path.isAbsolute(sanitizedOutputPath)) {
      throw new Error('Both input and output paths must be absolute');
    }

    if (sanitizedInputPath.includes('..') || sanitizedOutputPath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    // Build Ghostscript command
    const gsCommand = [
      'gs',
      '-sDEVICE=pdfwrite',
      `-dCompatibilityLevel=${compatibilityLevel}`,
      `-dPDFSETTINGS=/${quality}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      '-dSAFER', // Security feature
      '-dNODISPLAY',
      `-sOutputFile="${sanitizedOutputPath}"`,
      `"${sanitizedInputPath}"`
    ].join(' ');

    console.log(`🔄 Compressing PDF: ${path.basename(inputPath)}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Command: ${gsCommand}`);
    }

    // Execute Ghostscript command with timeout
    const { stdout, stderr } = await execAsync(gsCommand, {
      timeout: 60000, // 60 seconds timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    // Check if output file was created
    if (!existsSync(sanitizedOutputPath)) {
      throw new Error('Compressed PDF was not created');
    }

    // Get compressed file size
    const compressedStats = await fs.stat(sanitizedOutputPath);
    const compressedSize = compressedStats.size;

    // Calculate compression ratio
    const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ PDF compressed successfully:`);
      console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Compression ratio: ${compressionRatio}%`);
    }

    return {
      success: true,
      originalSize,
      compressedSize,
      compressionRatio
    };

  } catch (error: any) {
    console.error('❌ PDF compression failed:', error.message);
    
    // Clean up output file if it exists but compression failed
    try {
      if (existsSync(outputPath)) {
        await fs.unlink(outputPath);
      }
    } catch (cleanupError) {
      console.error('Failed to clean up output file:', cleanupError);
    }

    return {
      success: false,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      error: error.message
    };
  }
}

/**
 * Checks if Ghostscript is installed and available
 * @returns Promise<boolean>
 */
export async function checkGhostscriptAvailability(): Promise<boolean> {
  try {
    await execAsync('gs --version', { timeout: 5000 });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Ghostscript not found. Please install Ghostscript to enable PDF compression.');
    }
    return false;
  }
}

/**
 * Gets the optimal compression quality based on file size
 * @param fileSizeBytes - File size in bytes
 * @returns Optimal quality setting
 */
export function getOptimalQuality(fileSizeBytes: number): CompressionOptions['quality'] {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  if (fileSizeMB > 10) {
    return 'screen'; // Highest compression
  } else if (fileSizeMB > 5) {
    return 'ebook'; // Medium compression
  } else {
    return 'printer'; // Lower compression to maintain quality
  }
}

/**
 * Safely deletes a temporary file
 * @param filePath - Path to the file to delete
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Cleaned up temp file: ${path.basename(filePath)}`);
      }
    }
  } catch (error) {
    console.error(`Failed to cleanup temp file ${filePath}:`, error);
  }
}
