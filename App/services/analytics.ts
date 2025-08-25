import { api } from '../lib/api';

export interface PageViewData {
  page: string;
  userId?: string;
  userAgent?: string;
  platform: 'app';
}

export class AnalyticsService {
  /**
   * Record a page view for mobile app
   */
  static async recordPageView(data: Omit<PageViewData, 'platform'>): Promise<void> {
    try {
      await api.post('/page-views', {
        ...data,
        platform: 'app',
        userAgent: `ShalaShikshak App/${process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'}`,
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Page tracking failed:', error);
    }
  }

  /**
   * Track screen navigation in the app
   */
  static async trackScreen(screenName: string, userId?: string): Promise<void> {
    await this.recordPageView({
      page: `/app/${screenName}`,
      userId,
    });
  }

  /**
   * Track chapter view
   */
  static async trackChapterView(chapterId: string, userId?: string): Promise<void> {
    await this.recordPageView({
      page: `/chapter/${chapterId}`,
      userId,
    });
  }

  /**
   * Track subject view
   */
  static async trackSubjectView(subjectId: string, userId?: string): Promise<void> {
    await this.recordPageView({
      page: `/subject/${subjectId}`,
      userId,
    });
  }

  /**
   * Track standard view
   */
  static async trackStandardView(standardId: string, userId?: string): Promise<void> {
    await this.recordPageView({
      page: `/standard/${standardId}`,
      userId,
    });
  }

  /**
   * Track PDF viewer usage
   */
  static async trackPDFView(resourceId: string, userId?: string): Promise<void> {
    await this.recordPageView({
      page: `/pdf-viewer?resource=${resourceId}`,
      userId,
    });
  }

  /**
   * Track bookmarks page
   */
  static async trackBookmarks(userId?: string): Promise<void> {
    await this.recordPageView({
      page: '/bookmarks',
      userId,
    });
  }

  /**
   * Track home page
   */
  static async trackHome(userId?: string): Promise<void> {
    await this.recordPageView({
      page: '/',
      userId,
    });
  }
}
