"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('✅ Created uploads directory');
}
class LocalFileService {
    constructor() { }
    static getInstance() {
        if (!LocalFileService.instance) {
            LocalFileService.instance = new LocalFileService();
        }
        return LocalFileService.instance;
    }
    /**
     * Upload a PDF file to local uploads folder
     * @param fileBuffer - The file buffer to upload
     * @param fileName - The name of the file
     * @param originalName - The original file name
     * @returns Local file information
     */
    uploadPDF(fileBuffer, fileName, originalName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate unique file ID
                const fileId = (0, uuid_1.v4)();
                // Create unique filename with timestamp
                const timestamp = Date.now();
                const fileExtension = path.extname(originalName) || '.pdf';
                const uniqueFileName = `${path.parse(fileName).name}-${timestamp}-${fileId}${fileExtension}`;
                // Full file path
                const filePath = path.join(UPLOADS_DIR, uniqueFileName);
                console.log("Saving file locally:", uniqueFileName);
                // Write file to uploads directory
                yield fs.promises.writeFile(filePath, fileBuffer);
                // Get file stats
                const stats = yield fs.promises.stat(filePath);
                // Generate URL for accessing the file
                const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;
                console.log(`Successfully saved file: ${uniqueFileName}`);
                return {
                    id: fileId,
                    name: uniqueFileName,
                    filePath: filePath,
                    url: fileUrl,
                    mimeType: 'application/pdf',
                    size: stats.size.toString(),
                };
            }
            catch (error) {
                console.error('Error saving file locally:', error);
                throw new Error('Failed to save file locally');
            }
        });
    }
    /**
     * Delete a file from local uploads folder
     * @param filePath - The local file path or filename
     */
    deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fullPath;
                // Check if it's already a full path or just filename
                if (path.isAbsolute(filePath)) {
                    fullPath = filePath;
                }
                else {
                    // Extract filename from URL if needed
                    const fileName = path.basename(filePath);
                    fullPath = path.join(UPLOADS_DIR, fileName);
                }
                // Check if file exists
                if (fs.existsSync(fullPath)) {
                    yield fs.promises.unlink(fullPath);
                    console.log(`Successfully deleted file: ${fullPath}`);
                }
                else {
                    console.warn(`File not found for deletion: ${fullPath}`);
                }
            }
            catch (error) {
                console.error('Error deleting file:', error);
                throw new Error('Failed to delete file');
            }
        });
    }
    /**
     * Get file information
     * @param filePath - The local file path or filename
     */
    getFileInfo(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fullPath;
                // Check if it's already a full path or just filename
                if (path.isAbsolute(filePath)) {
                    fullPath = filePath;
                }
                else {
                    const fileName = path.basename(filePath);
                    fullPath = path.join(UPLOADS_DIR, fileName);
                }
                // Check if file exists
                if (!fs.existsSync(fullPath)) {
                    return null;
                }
                // Get file stats
                const stats = yield fs.promises.stat(fullPath);
                const fileName = path.basename(fullPath);
                // Generate URL for accessing the file
                const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                const fileUrl = `${baseUrl}/uploads/${fileName}`;
                return {
                    id: path.parse(fileName).name,
                    name: fileName,
                    filePath: fullPath,
                    url: fileUrl,
                    mimeType: 'application/pdf',
                    size: stats.size.toString(),
                };
            }
            catch (error) {
                console.error('Error getting file info:', error);
                return null;
            }
        });
    }
    /**
     * List all files in uploads directory
     */
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield fs.promises.readdir(UPLOADS_DIR);
                const fileInfos = [];
                for (const fileName of files) {
                    if (path.extname(fileName).toLowerCase() === '.pdf') {
                        const fileInfo = yield this.getFileInfo(fileName);
                        if (fileInfo) {
                            fileInfos.push(fileInfo);
                        }
                    }
                }
                return fileInfos;
            }
            catch (error) {
                console.error('Error listing files:', error);
                return [];
            }
        });
    }
}
exports.LocalFileService = LocalFileService;
