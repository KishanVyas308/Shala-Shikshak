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
exports.GoogleDriveService = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = __importDefault(require("stream"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Service Account configuration
const serviceAccountKeyPath = path_1.default.join(__dirname, '../../pdf-storage-466112-127984f2414d.json');
// Check if service account key file exists
if (!fs_1.default.existsSync(serviceAccountKeyPath)) {
    throw new Error('Service account key file not found at: ' + serviceAccountKeyPath);
}
// Load service account credentials
const serviceAccountKey = JSON.parse(fs_1.default.readFileSync(serviceAccountKeyPath, 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// Function to authorize and get JWT client
function authorize() {
    return __awaiter(this, void 0, void 0, function* () {
        const jwtClient = new googleapis_1.google.auth.JWT({
            email: serviceAccountKey.client_email,
            key: serviceAccountKey.private_key,
            scopes: SCOPES,
        });
        yield jwtClient.authorize();
        return jwtClient;
    });
}
class GoogleDriveService {
    constructor() {
        this.FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
        this.appFolderId = null;
    }
    static getInstance() {
        if (!GoogleDriveService.instance) {
            GoogleDriveService.instance = new GoogleDriveService();
        }
        return GoogleDriveService.instance;
    }
    /**
     * Create or get the app folder in Google Drive
     * This will use the folder ID from environment variable if provided,
     * otherwise create a new folder in the root directory
     */
    getAppFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.appFolderId) {
                return this.appFolderId;
            }
            try {
                // Get authorized client
                const authClient = yield authorize();
                const drive = googleapis_1.google.drive({ version: 'v3', auth: authClient });
                // If a specific folder ID is provided, use it
                if (this.FOLDER_ID !== 'root') {
                    this.appFolderId = this.FOLDER_ID;
                    return this.appFolderId;
                }
                // Search for existing "Shala-Shikshak-PDFs" folder in root
                const response = yield drive.files.list({
                    q: `name='Shala-Shikshak-PDFs' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                    fields: 'files(id, name)',
                });
                if (response.data.files && response.data.files.length > 0) {
                    this.appFolderId = response.data.files[0].id;
                    return this.appFolderId;
                }
                // Create new folder in root
                const folderMetadata = {
                    name: 'Shala-Shikshak-PDFs',
                    mimeType: 'application/vnd.google-apps.folder',
                };
                const folderResponse = yield drive.files.create({
                    requestBody: folderMetadata,
                    fields: 'id',
                });
                this.appFolderId = folderResponse.data.id;
                // Make the folder publicly viewable
                yield drive.permissions.create({
                    fileId: this.appFolderId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
                console.log(`Created new folder 'Shala-Shikshak-PDFs' with ID: ${this.appFolderId}`);
                return this.appFolderId;
            }
            catch (error) {
                console.error('Error creating/getting app folder:', error);
                // Fallback to root folder if folder creation fails
                return 'root';
            }
        });
    }
    /**
     * Upload a PDF file to Google Drive
     * @param fileBuffer - The file buffer to upload
     * @param fileName - The name of the file
     * @param originalName - The original file name
     * @returns Google Drive file information
     */
    uploadPDF(fileBuffer, fileName, originalName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get authorized client
                const authClient = yield authorize();
                const drive = googleapis_1.google.drive({ version: 'v3', auth: authClient });
                // Get the app folder (creates it if it doesn't exist)
                const parentFolderId = yield this.getAppFolder();
                // Create a readable stream from the buffer
                const bufferStream = new stream_1.default.PassThrough();
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
                const response = yield drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: 'id,name,webViewLink,webContentLink,mimeType,size',
                });
                // Make the file publicly viewable
                yield drive.permissions.create({
                    fileId: response.data.id,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
                console.log(`Successfully uploaded file to Google Drive: ${response.data.name} (ID: ${response.data.id})`);
                return {
                    id: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink,
                    webContentLink: response.data.webContentLink,
                    mimeType: response.data.mimeType,
                    size: response.data.size || '0',
                };
            }
            catch (error) {
                console.error('Error uploading file to Google Drive:', error);
                throw new Error('Failed to upload file to Google Drive');
            }
        });
    } /**
     * Delete a file from Google Drive
     * @param fileId - The Google Drive file ID
     */
    deleteFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get authorized client
                const authClient = yield authorize();
                const drive = googleapis_1.google.drive({ version: 'v3', auth: authClient });
                yield drive.files.delete({
                    fileId: fileId,
                });
                console.log(`Successfully deleted file from Google Drive: ${fileId}`);
            }
            catch (error) {
                console.error('Error deleting file from Google Drive:', error);
                // Don't throw error for deletion failures to prevent blocking chapter deletion
                console.warn(`Failed to delete file ${fileId} from Google Drive, continuing...`);
            }
        });
    }
    /**
     * Get file information from Google Drive
     * @param fileId - The Google Drive file ID
     * @returns File information
     */
    getFileInfo(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get authorized client
                const authClient = yield authorize();
                const drive = googleapis_1.google.drive({ version: 'v3', auth: authClient });
                const response = yield drive.files.get({
                    fileId: fileId,
                    fields: 'id,name,webViewLink,webContentLink,mimeType,size',
                });
                return {
                    id: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink,
                    webContentLink: response.data.webContentLink,
                    mimeType: response.data.mimeType,
                    size: response.data.size || '0',
                };
            }
            catch (error) {
                console.error('Error getting file info from Google Drive:', error);
                throw new Error('Failed to get file info from Google Drive');
            }
        });
    }
    /**
     * Create a public viewing link for a PDF file
     * @param fileId - The Google Drive file ID
     * @returns Public viewing URL
     */
    getPublicViewingLink(fileId) {
        // Return a direct link that can be used in PDF viewers
        return `https://drive.google.com/file/d/${fileId}/view`;
    }
    /**
     * Create a direct download link for a PDF file
     * @param fileId - The Google Drive file ID
     * @returns Direct download URL
     */
    getDirectDownloadLink(fileId) {
        // Return a direct download link
        return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
    /**
     * Get embedded viewer link for PDF
     * @param fileId - The Google Drive file ID
     * @returns Embedded viewer URL
     */
    getEmbeddedViewerLink(fileId) {
        // Return an embedded viewer link
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
}
exports.GoogleDriveService = GoogleDriveService;
exports.default = GoogleDriveService;
