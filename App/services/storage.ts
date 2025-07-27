import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_STANDARDS: 'user_selected_standards',
  BOOKMARKED_SUBJECTS: 'bookmarked_subjects',
  BOOKMARKED_CHAPTERS: 'bookmarked_chapters',
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

  // BOOKMARK FUNCTIONS FOR SUBJECTS
  // Get bookmarked subjects
  async getBookmarkedSubjects(): Promise<string[]> {
    try {
      const subjectIds = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_SUBJECTS);
      return subjectIds ? JSON.parse(subjectIds) : [];
    } catch (error) {
      console.error('Error getting bookmarked subjects:', error);
      return [];
    }
  },

  // Add subject to bookmarks
  async addSubjectBookmark(subjectId: string): Promise<void> {
    try {
      const currentBookmarks = await this.getBookmarkedSubjects();
      if (!currentBookmarks.includes(subjectId)) {
        const updatedBookmarks = [...currentBookmarks, subjectId];
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_SUBJECTS, JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error adding subject bookmark:', error);
      throw error;
    }
  },

  // Remove subject from bookmarks
  async removeSubjectBookmark(subjectId: string): Promise<void> {
    try {
      const currentBookmarks = await this.getBookmarkedSubjects();
      const updatedBookmarks = currentBookmarks.filter(id => id !== subjectId);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_SUBJECTS, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing subject bookmark:', error);
      throw error;
    }
  },

  // Toggle subject bookmark
  async toggleSubjectBookmark(subjectId: string): Promise<boolean> {
    try {
      const currentBookmarks = await this.getBookmarkedSubjects();
      if (currentBookmarks.includes(subjectId)) {
        await this.removeSubjectBookmark(subjectId);
        return false; // Removed
      } else {
        await this.addSubjectBookmark(subjectId);
        return true; // Added
      }
    } catch (error) {
      console.error('Error toggling subject bookmark:', error);
      throw error;
    }
  },

  // Check if subject is bookmarked
  async isSubjectBookmarked(subjectId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarkedSubjects();
      return bookmarks.includes(subjectId);
    } catch (error) {
      console.error('Error checking subject bookmark:', error);
      return false;
    }
  },

  // BOOKMARK FUNCTIONS FOR CHAPTERS
  // Get bookmarked chapters
  async getBookmarkedChapters(): Promise<string[]> {
    try {
      const chapterIds = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_CHAPTERS);
      return chapterIds ? JSON.parse(chapterIds) : [];
    } catch (error) {
      console.error('Error getting bookmarked chapters:', error);
      return [];
    }
  },

  // Add chapter to bookmarks
  async addChapterBookmark(chapterId: string): Promise<void> {
    try {
      const currentBookmarks = await this.getBookmarkedChapters();
      if (!currentBookmarks.includes(chapterId)) {
        const updatedBookmarks = [...currentBookmarks, chapterId];
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_CHAPTERS, JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error adding chapter bookmark:', error);
      throw error;
    }
  },

  // Remove chapter from bookmarks
  async removeChapterBookmark(chapterId: string): Promise<void> {
    try {
      const currentBookmarks = await this.getBookmarkedChapters();
      const updatedBookmarks = currentBookmarks.filter(id => id !== chapterId);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_CHAPTERS, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing chapter bookmark:', error);
      throw error;
    }
  },

  // Toggle chapter bookmark
  async toggleChapterBookmark(chapterId: string): Promise<boolean> {
    try {
      const currentBookmarks = await this.getBookmarkedChapters();
      if (currentBookmarks.includes(chapterId)) {
        await this.removeChapterBookmark(chapterId);
        return false; // Removed
      } else {
        await this.addChapterBookmark(chapterId);
        return true; // Added
      }
    } catch (error) {
      console.error('Error toggling chapter bookmark:', error);
      throw error;
    }
  },

  // Check if chapter is bookmarked
  async isChapterBookmarked(chapterId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarkedChapters();
      return bookmarks.includes(chapterId);
    } catch (error) {
      console.error('Error checking chapter bookmark:', error);
      return false;
    }
  },

  // Clear all bookmarks
  async clearAllBookmarks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.BOOKMARKED_SUBJECTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.BOOKMARKED_CHAPTERS);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      throw error;
    }
  },
};