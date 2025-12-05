import Constants from 'expo-constants';
import { API_BASE_URL } from '../lib/api';

export const checkAppVersion = async (): Promise<{ needsUpdate: boolean; currentVersion: string; availableVersions: string[] }> => {
  try {
    const currentVersion = '5.0.0';
    
    const response = await fetch(`${API_BASE_URL}/app/versions`);
    const data = await response.json();
    
    const availableVersions = data.versions || [];
    const needsUpdate = !availableVersions.includes(currentVersion);
    
    return {
      needsUpdate,
      currentVersion,
      availableVersions
    };
  } catch (error) {
    console.error('Error checking app version:', error);
    return {
      needsUpdate: false,
      currentVersion: '5.0.0',
      availableVersions: []
    };
  }
};
