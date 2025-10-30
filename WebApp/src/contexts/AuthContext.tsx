import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/auth';
import type { Admin } from '../types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { isLoading, data } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authAPI.verify,
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setAdmin(data.admin);
      setIsAuthenticated(true);
    }
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedAdmin = localStorage.getItem('admin');
    
    if (token && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setAdmin(adminData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
      }
    }
  }, []);

  const login = (token: string, adminData: Admin) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authAPI.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
