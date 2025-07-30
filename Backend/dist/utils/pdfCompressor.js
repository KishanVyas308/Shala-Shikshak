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
exports.compressPDF = compressPDF;
exports.checkGhostscriptAvailability = checkGhostscriptAvailability;
exports.getOptimalQuality = getOptimalQuality;
exports.cleanupTempFile = cleanupTempFile;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Compresses a PDF file using Ghostscript
 * @param inputPath - Absolute path to the input PDF file
 * @param outputPath - Absolute path for the compressed PDF output
 * @param options - Compression options
 * @returns Promise<{ success: boolean, originalSize: number, compressedSize: number, compressionRatio: number }>
 */
function compressPDF(inputPath_1, outputPath_1) {
    return __awaiter(this, arguments, void 0, function* (inputPath, outputPath, options = {}) {
        const { quality = 'ebook', compatibilityLevel = '1.4' } = options;
        try {
            // Validate input file exists
            if (!(0, fs_1.existsSync)(inputPath)) {
                throw new Error(`Input file does not exist: ${inputPath}`);
            }
            // Get original file size
            const originalStats = yield promises_1.default.stat(inputPath);
            const originalSize = originalStats.size;
            // Ensure output directory exists
            const outputDir = path_1.default.dirname(outputPath);
            yield promises_1.default.mkdir(outputDir, { recursive: true });
            // Sanitize paths to prevent injection
            const sanitizedInputPath = path_1.default.normalize(inputPath);
            const sanitizedOutputPath = path_1.default.normalize(outputPath);
            // Validate paths are absolute and don't contain dangerous patterns
            if (!path_1.default.isAbsolute(sanitizedInputPath) || !path_1.default.isAbsolute(sanitizedOutputPath)) {
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
            console.log(`🔄 Compressing PDF: ${path_1.default.basename(inputPath)}`);
            console.log(`📝 Command: ${gsCommand}`);
            // Execute Ghostscript command with timeout
            const { stdout, stderr } = yield execAsync(gsCommand, {
                timeout: 60000, // 60 seconds timeout
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            // Check if output file was created
            if (!(0, fs_1.existsSync)(sanitizedOutputPath)) {
                throw new Error('Compressed PDF was not created');
            }
            // Get compressed file size
            const compressedStats = yield promises_1.default.stat(sanitizedOutputPath);
            const compressedSize = compressedStats.size;
            // Calculate compression ratio
            const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
            console.log(`✅ PDF compressed successfully:`);
            console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Compression ratio: ${compressionRatio}%`);
            return {
                success: true,
                originalSize,
                compressedSize,
                compressionRatio
            };
        }
        catch (error) {
            console.error('❌ PDF compression failed:', error.message);
            // Clean up output file if it exists but compression failed
            try {
                if ((0, fs_1.existsSync)(outputPath)) {
                    yield promises_1.default.unlink(outputPath);
                }
            }
            catch (cleanupError) {
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
    });
}
/**
 * Checks if Ghostscript is installed and available
 * @returns Promise<boolean>
 */
function checkGhostscriptAvailability() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield execAsync('gs --version', { timeout: 5000 });
            return true;
        }
        catch (error) {
            console.error('❌ Ghostscript not found. Please install Ghostscript to enable PDF compression.');
            return false;
        }
    });
}
/**
 * Gets the optimal compression quality based on file size
 * @param fileSizeBytes - File size in bytes
 * @returns Optimal quality setting
 */
function getOptimalQuality(fileSizeBytes) {
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    if (fileSizeMB > 10) {
        return 'screen'; // Highest compression
    }
    else if (fileSizeMB > 5) {
        return 'ebook'; // Medium compression
    }
    else {
        return 'printer'; // Lower compression to maintain quality
    }
}
/**
 * Safely deletes a temporary file
 * @param filePath - Path to the file to delete
 */
function cleanupTempFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if ((0, fs_1.existsSync)(filePath)) {
                yield promises_1.default.unlink(filePath);
                console.log(`🗑️ Cleaned up temp file: ${path_1.default.basename(filePath)}`);
            }
        }
        catch (error) {
            console.error(`Failed to cleanup temp file ${filePath}:`, error);
        }
    });
}
