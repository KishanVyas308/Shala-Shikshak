import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_STANDARDS: 'user_selected_standards',
};

export const storageService = {
  // Get user selected standards
  async getUserStandards(): Promise<string[]> {
    try {
      const standardIds = await AsyncStorage.getItem(STORAGE_KEYS.USER_STANDARDS);
      return standardIds ? JSON.parse(standardIds) : [];
    } catch (error) {
      console.error('Error getting user standards:', error);
      return [];
    }
  },

  // Set user selected standards
  async setUserStandards(standardIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STANDARDS, JSON.stringify(standardIds));
    } catch (error) {
      console.error('Error setting user standards:', error);
      throw error;
    }
  },

  // Add a standard to user's selection
  async addUserStandard(standardId: string): Promise<void> {
    try {
      const currentStandards = await this.getUserStandards();
      if (!currentStandards.includes(standardId)) {
        const updatedStandards = [...currentStandards, standardId];
        await this.setUserStandards(updatedStandards);
      }
    } catch (error) {
      console.error('Error adding user standard:', error);
      throw error;
    }
  },

  // Remove a standard from user's selection
  async removeUserStandard(standardId: string): Promise<void> {
    try {
      const currentStandards = await this.getUserStandards();
      const updatedStandards = currentStandards.filter(id => id !== standardId);
      await this.setUserStandards(updatedStandards);
    } catch (error) {
      console.error('Error removing user standard:', error);
      throw error;
    }
  },

  // Toggle standard selection
  async toggleUserStandard(standardId: string): Promise<void> {
    try {
      const currentStandards = await this.getUserStandards();
      if (currentStandards.includes(standardId)) {
        await this.removeUserStandard(standardId);
      } else {
        await this.addUserStandard(standardId);
      }
    } catch (error) {
      console.error('Error toggling user standard:', error);
      throw error;
    }
  },

  // Check if user has any standards selected
  async hasSelectedStandards(): Promise<boolean> {
    try {
      const standards = await this.getUserStandards();
      return standards.length > 0;
    } catch (error) {
      console.error('Error checking selected standards:', error);
      return false;
    }
  },

  // Clear all user standards
  async clearUserStandards(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_STANDARDS);
    } catch (error) {
      console.error('Error clearing user standards:', error);
      throw error;
    }
  },
};