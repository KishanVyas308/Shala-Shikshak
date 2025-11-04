import { api } from '../lib/api';

export class AnalyticsService {
  private static hasTrackedAppOpen = false;

  /**
   * Track app open - called once per app session
   */
  static async trackAppOpen(): Promise<void> {
    // Only track once per session
    if (this.hasTrackedAppOpen) {
      return;
    }

    try {
      await api.post('/analytics/app-open', {
        platform: 'app',
        timestamp: new Date().toISOString(),
      });
      this.hasTrackedAppOpen = true;
      console.log('App open tracked');
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('App open tracking failed:', error);
    }
  }

  // Empty methods to maintain compatibility
  static async trackScreen(screenName: string, userId?: string): Promise<void> {
    // No-op
  }

  static async trackChapterView(chapterId: string, userId?: string): Promise<void> {
    // No-op
  }

  static async trackSubjectView(subjectId: string, userId?: string): Promise<void> {
    // No-op
  }

  static async trackStandardView(standardId: string, userId?: string): Promise<void> {
    // No-op
  }

  static async trackPDFView(resourceId: string, userId?: string): Promise<void> {
    // No-op
  }

  static async trackBookmarks(userId?: string): Promise<void> {
    // No-op
  }

  static async trackHome(userId?: string): Promise<void> {
    // No-op
  }
}
