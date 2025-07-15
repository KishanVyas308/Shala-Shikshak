import api from '../lib/api';
import type { UploadResponse } from '../types';

export interface GoogleDriveUploadResponse {
  message: string;
  fileId: string;
  fileName: string;
  originalName: string;
  size: string;
  viewingUrl: string;
  embeddedUrl: string;
}

export const uploadAPI = {
  uploadPdf: async (file: File): Promise<GoogleDriveUploadResponse> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePdf: async (fileId: string): Promise<void> => {
    await api.delete(`/upload/pdf/${fileId}`);
  },

  getPdfInfo: async (fileId: string): Promise<GoogleDriveUploadResponse> => {
    const response = await api.get(`/upload/pdf/${fileId}`);
    return response.data;
  }
};
