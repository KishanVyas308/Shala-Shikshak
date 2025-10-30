import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Local file storage interface
export interface LocalFile {
  id: string;
  name: string;
  filePath: string;
  url: string;
  mimeType: string;
  size: string;
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created uploads directory');
  }
}

export class LocalFileService {
  private static instance: LocalFileService;

  private constructor() {}

  public static getInstance(): LocalFileService {
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
  async uploadPDF(fileBuffer: Buffer, fileName: string, originalName: string): Promise<LocalFile> {
    try {
      // Generate unique file ID
      const fileId = uuidv4();
      
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = path.extname(originalName) || '.pdf';
      const uniqueFileName = `${path.parse(fileName).name}-${timestamp}-${fileId}${fileExtension}`;
      
      // Full file path
      const filePath = path.join(UPLOADS_DIR, uniqueFileName);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Saving file locally:", uniqueFileName);
      }
      
      // Write file to uploads directory
      await fs.promises.writeFile(filePath, fileBuffer);
      
      // Get file stats
      const stats = await fs.promises.stat(filePath);
      
      // Generate URL for accessing the file
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Successfully saved file: ${uniqueFileName}`);
      }
      
      return {
        id: fileId,
        name: uniqueFileName,
        filePath: filePath,
        url: fileUrl,
        mimeType: 'application/pdf',
        size: stats.size.toString(),
      };
    } catch (error) {
      console.error('Error saving file locally:', error);
      throw new Error('Failed to save file locally');
    }
  }

  /**
   * Delete a file from local uploads folder
   * @param filePath - The local file path or filename
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      let fullPath: string;
      
      // Check if it's already a full path or just filename
      if (path.isAbsolute(filePath)) {
        fullPath = filePath;
      } else {
        // Extract filename from URL if needed
        const fileName = path.basename(filePath);
        fullPath = path.join(UPLOADS_DIR, fileName);
      }
      
      // Check if file exists
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        if (process.env.NODE_ENV === 'development') {
          console.log(`Successfully deleted file: ${fullPath}`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`File not found for deletion: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file information
   * @param filePath - The local file path or filename
   */
  async getFileInfo(filePath: string): Promise<LocalFile | null> {
    try {
      let fullPath: string;
      
      // Check if it's already a full path or just filename
      if (path.isAbsolute(filePath)) {
        fullPath = filePath;
      } else {
        const fileName = path.basename(filePath);
        fullPath = path.join(UPLOADS_DIR, fileName);
      }
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return null;
      }
      
      // Get file stats
      const stats = await fs.promises.stat(fullPath);
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
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * List all files in uploads directory
   */
  async listFiles(): Promise<LocalFile[]> {
    try {
      const files = await fs.promises.readdir(UPLOADS_DIR);
      const fileInfos: LocalFile[] = [];
      
      for (const fileName of files) {
        if (path.extname(fileName).toLowerCase() === '.pdf') {
          const fileInfo = await this.getFileInfo(fileName);
          if (fileInfo) {
            fileInfos.push(fileInfo);
          }
        }
      }
      
      return fileInfos;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}
