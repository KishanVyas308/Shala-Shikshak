import api from '../lib/api';
import type { Standard, CreateStandardData } from '../types';

export const standardsAPI = {
  getAll: async (): Promise<Standard[]> => {
    const response = await api.get('/standards');
    return response.data;
  },

  getById: async (id: string): Promise<Standard> => {
    const response = await api.get(`/standards/${id}`);
    return response.data;
  },

  create: async (data: CreateStandardData): Promise<Standard> => {
    const response = await api.post('/standards', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateStandardData>): Promise<Standard> => {
    const response = await api.put(`/standards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/standards/${id}`);
  },

  batchReorder: async (standards: { id: string; order: number }[]): Promise<Standard[]> => {
    const response = await api.put('/standards/batch/reorder', { standards });
    return response.data;
  }
};
