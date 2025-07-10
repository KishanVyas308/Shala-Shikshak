import api from '../lib/api';
import type { Chapter } from '../types';

export const chaptersAPI = {
  getAll: async (): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>('/chapters');
    return response.data;
  },

  getById: async (id: string): Promise<Chapter> => {
    const response = await api.get<Chapter>(`/chapters/${id}`);
    return response.data;
  },

  getBySubjectId: async (subjectId: string): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/chapters/subject/${subjectId}`);
    return response.data;
  },
};
