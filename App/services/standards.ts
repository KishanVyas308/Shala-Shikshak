import api from '../lib/api';
import type { Standard } from '../types';

export const standardsAPI = {
  getAll: async (): Promise<Standard[]> => {
    const response = await api.get<Standard[]>('/standards');
    return response.data;
  },

  getById: async (id: string): Promise<Standard> => {
    const response = await api.get<Standard>(`/standards/${id}`);
    return response.data;
  },
};
