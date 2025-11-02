import { api } from '../lib/api';

// Simple stats interface
interface SimpleStats {
  totalOpens: number;
  appOpens: number;
  webOpens: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export class AnalyticsService {
  private static hasTrackedOpen = false;

  /**
   * Track website open (only once per session)
   */
  static async trackWebsiteOpen(): Promise<void> {
    if (this.hasTrackedOpen) {
      return;
    }

    try {
      await api.post('/analytics/app-open', {
        platform: 'web',
      });
      this.hasTrackedOpen = true;
    } catch (error) {
      console.error('Failed to track website open:', error);
    }
  }

  /**
   * Get simple stats (admin only)
   */
  static async getSimpleStats(): Promise<SimpleStats> {
    const response = await api.get('/analytics/stats');
    return response.data;
  }
}
