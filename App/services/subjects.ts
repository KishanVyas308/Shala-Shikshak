import api from '../lib/api';
import type { Subject } from '../types';

export const subjectsAPI = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>('/subjects');
    return response.data;
  },

  getById: async (id: string): Promise<Subject> => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  getByStandardId: async (standardId: string): Promise<Subject[]> => {
    const response = await api.get<Subject[]>(`/subjects/standard/${standardId}`);
    return response.data;
  },
};
