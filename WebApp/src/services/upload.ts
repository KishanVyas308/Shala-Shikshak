import api from '../lib/api';

export interface LocalUploadResponse {
  message: string;
  fileId: string;
  fileName: string;
  originalName: string;
  size: number;
  url: string;
  filePath: string;
  // Compatibility fields
  viewingUrl: string;
  embeddedUrl: string;
}

export const uploadAPI = {
  uploadPdf: async (file: File): Promise<LocalUploadResponse> => {
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

  getPdfInfo: async (fileId: string): Promise<LocalUploadResponse> => {
    const response = await api.get(`/upload/pdf/${fileId}`);
    return response.data;
  }
};
