import api from '../lib/api';
import type { UploadResponse } from '../types';

export const uploadAPI = {
  uploadPdf: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePdf: async (filename: string): Promise<void> => {
    await api.delete(`/upload/pdf/${filename}`);
  }
};
