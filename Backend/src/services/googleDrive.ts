import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import stream from 'stream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token if available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  size: string;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private readonly FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
  private appFolderId: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Get OAuth2 authorization URL
   * @returns Authorization URL for OAuth2 flow
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   * @param code - Authorization code from OAuth2 callback
   * @returns Token information
   */
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      console.log('OAuth2 tokens received:', tokens);
      console.log('Refresh token:', tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to get OAuth2 tokens');
    }
  }

  /**
   * Check if OAuth2 is properly configured
   * @returns True if OAuth2 is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
  }

  /**
   * Refresh access token if needed
   */
  private async ensureValidToken(): Promise<void> {
    try {
      if (!this.isConfigured()) {
        throw new Error('OAuth2 not properly configured. Please set all required environment variables.');
      }

      // Check if we have a valid access token
      const credentials = oauth2Client.credentials;
      
      // If no access token or it's expired, refresh it
      if (!credentials.access_token || (credentials.expiry_date && credentials.expiry_date < Date.now())) {
        console.log('Access token expired or missing, refreshing...');
        
        try {
          const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(newCredentials);
          console.log('✅ Access token refreshed successfully');
        } catch (refreshError) {
          console.error('❌ Error refreshing token:', refreshError);
          const errorMessage = refreshError instanceof Error ? refreshError.message : 'Unknown error';
          throw new Error(`Failed to refresh access token: ${errorMessage}. Please re-authenticate using the get-refresh-token.js script.`);
        }
      }
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      throw error;
    }
  }

  /**
   * Create or get the app folder in Google Drive
   * This will use the folder ID from environment variable if provided,
   * otherwise create a new folder in the root directory
   */
  private async getAppFolder(): Promise<string> {
    if (this.appFolderId) {
      return this.appFolderId;
    }

    try {
      // Ensure we have a valid access token
      await this.ensureValidToken();

      // If a specific folder ID is provided, use it
      if (this.FOLDER_ID !== 'root') {
        this.appFolderId = this.FOLDER_ID;
        return this.appFolderId;
      }

      // Search for existing "Shala-Shikshak-PDFs" folder in root
      const response = await drive.files.list({
        q: `name='Shala-Shikshak-PDFs' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        this.appFolderId = response.data.files[0].id!;
        return this.appFolderId;
      }

      // Create new folder in root
      const folderMetadata = {
        name: 'Shala-Shikshak-PDFs',
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      this.appFolderId = folderResponse.data.id!;
      
      // Make the folder publicly viewable
      await drive.permissions.create({
        fileId: this.appFolderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log(`Created new folder 'Shala-Shikshak-PDFs' with ID: ${this.appFolderId}`);
      return this.appFolderId;
    } catch (error) {
      console.error('Error creating/getting app folder:', error);
      // Fallback to root folder if folder creation fails
      return 'root';
    }
  }

  /**
   * Upload a PDF file to Google Drive
   * @param fileBuffer - The file buffer to upload
   * @param fileName - The name of the file
   * @param originalName - The original file name
   * @returns Google Drive file information
   */
  async uploadPDF(fileBuffer: Buffer, fileName: string, originalName: string): Promise<GoogleDriveFile> {
    try {
      // Ensure we have a valid access token
      await this.ensureValidToken();

      // Get the app folder (creates it if it doesn't exist)
      const parentFolderId = await this.getAppFolder();

      // Create a readable stream from the buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const fileMetadata = {
        name: fileName,
        mimeType: "application/pdf",
        parents: [parentFolderId],
      };

      const media = {
        mimeType: 'application/pdf',
        body: bufferStream,
      };
      
      console.log("Uploading file to Google Drive:", fileName);
      console.log(`File metadata: ${JSON.stringify(fileMetadata)}`);

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink,mimeType,size',
      });

      // Make the file publicly viewable
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log(`Successfully uploaded file to Google Drive: ${response.data.name} (ID: ${response.data.id})`);

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink!,
        webContentLink: response.data.webContentLink!,
        mimeType: response.data.mimeType!,
        size: response.data.size || '0',
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  /**
   * Delete a file from Google Drive
   * @param fileId - The Google Drive file ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      // Ensure we have a valid access token
      await this.ensureValidToken();

      await drive.files.delete({
        fileId: fileId,
      });
      console.log(`Successfully deleted file from Google Drive: ${fileId}`);
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      // Don't throw error for deletion failures to prevent blocking chapter deletion
      console.warn(`Failed to delete file ${fileId} from Google Drive, continuing...`);
    }
  }

  /**
   * Get file information from Google Drive
   * @param fileId - The Google Drive file ID
   * @returns File information
   */
  async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    try {
      // Ensure we have a valid access token
      await this.ensureValidToken();

      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,webContentLink,mimeType,size',
      });

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink!,
        webContentLink: response.data.webContentLink!,
        mimeType: response.data.mimeType!,
        size: response.data.size || '0',
      };
    } catch (error) {
      console.error('Error getting file info from Google Drive:', error);
      throw new Error('Failed to get file info from Google Drive');
    }
  }

  /**
   * Create a public viewing link for a PDF file
   * @param fileId - The Google Drive file ID
   * @returns Public viewing URL
   */
  getPublicViewingLink(fileId: string): string {
    // Return a direct link that can be used in PDF viewers
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /**
   * Create a direct download link for a PDF file
   * @param fileId - The Google Drive file ID
   * @returns Direct download URL
   */
  getDirectDownloadLink(fileId: string): string {
    // Return a direct download link
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  /**
   * Get embedded viewer link for PDF
   * @param fileId - The Google Drive file ID
   * @returns Embedded viewer URL
   */
  getEmbeddedViewerLink(fileId: string): string {
    // Return an embedded viewer link
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

export default GoogleDriveService;
