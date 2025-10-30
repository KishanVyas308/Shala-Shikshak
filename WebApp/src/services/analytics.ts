import { api } from '../lib/api';
import type { 
  PageViewCreateData, 
  AnalyticsOverview, 
  ViewsByDate 
} from '../types';

export class AnalyticsService {
  /**
   * Record a page view
   */
  static async recordPageView(data: PageViewCreateData): Promise<{ success: boolean; id: string }> {
    const response = await api.post('/page-views', {
      ...data,
      userAgent: navigator.userAgent,
      platform: 'web',
    });
    return response.data;
  }

  /**
   * Get analytics overview (admin only)
   */
  static async getAnalyticsOverview(days: number = 30): Promise<AnalyticsOverview> {
    const response = await api.get(`/analytics/overview?days=${days}`);
    return response.data;
  }

  /**
   * Get daily analytics for charts (admin only)
   */
  static async getDailyAnalytics(days: number = 30): Promise<ViewsByDate[]> {
    const response = await api.get(`/analytics/daily?days=${days}`);
    return response.data;
  }
}

// Utility functions for client-side analytics

/**
 * Track page view automatically
 */
export const trackPageView = async (page: string, userId?: string) => {
  try {
    await AnalyticsService.recordPageView({
      page,
      userId,
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Failed to track page view:', error);
  }
};

/**
 * Format analytics data for charts
 */
export const formatChartData = (viewsByDate: ViewsByDate[]) => {
  return viewsByDate.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    views: item.views,
    uniqueViews: item.uniqueViews,
  }));
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};
