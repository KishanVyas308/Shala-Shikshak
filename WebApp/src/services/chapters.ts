import api from '../lib/api';
import type { Chapter, CreateChapterData } from '../types';

export const chaptersAPI = {
  getBySubject: async (subjectId: string): Promise<Chapter[]> => {
    const response = await api.get(`/chapters/subject/${subjectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Chapter> => {
    const response = await api.get(`/chapters/${id}`);
    return response.data;
  },

  create: async (data: CreateChapterData): Promise<Chapter> => {
    const response = await api.post('/chapters', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateChapterData>): Promise<Chapter> => {
    const response = await api.put(`/chapters/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/chapters/${id}`);
  },

  batchReorder: async (chapters: { id: string; order: number }[]): Promise<void> => {
    await api.put('/chapters/batch/reorder', { chapters });
  }
};
