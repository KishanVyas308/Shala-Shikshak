import api from '../lib/api';
import type { Subject, CreateSubjectData } from '../types';

export const subjectsAPI = {
  getByStandard: async (standardId: string): Promise<Subject[]> => {
    const response = await api.get(`/subjects/standard/${standardId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: CreateSubjectData): Promise<Subject> => {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSubjectData>): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  }
};
