import api from '../lib/api';
import type { LoginCredentials, AuthResponse, Admin } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verify: async (): Promise<{ admin: Admin }> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
  }
};
