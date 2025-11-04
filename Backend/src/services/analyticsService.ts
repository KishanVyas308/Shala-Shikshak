import { prisma } from '../lib/prisma';

export class AnalyticsService {
  /**
   * Track app/website open
   */
  static async trackAppOpen(platform: 'app' | 'web' | 'unknown') {
    try {
      await prisma.pageView.create({
        data: {
          page: '/app-open',
          platform: platform === 'app' ? 'app' : 'web',
          userAgent: `${platform} open`,
        },
      });
    } catch (error) {
      console.error('Error tracking app open:', error);
    }
  }

  /**
   * Get simple stats - just count of opens
   */
  static async getSimpleStats() {
    const [totalOpens, appOpens, webOpens, last24Hours, last7Days, last30Days] = await Promise.all([
      // Total opens
      prisma.pageView.count({
        where: {
          page: '/app-open',
        },
      }),
      // App opens
      prisma.pageView.count({
        where: {
          page: '/app-open',
          platform: 'app',
        },
      }),
      // Web opens
      prisma.pageView.count({
        where: {
          page: '/app-open',
          platform: 'web',
        },
      }),
      // Last 24 hours
      prisma.pageView.count({
        where: {
          page: '/app-open',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Last 7 days
      prisma.pageView.count({
        where: {
          page: '/app-open',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Last 30 days
      prisma.pageView.count({
        where: {
          page: '/app-open',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalOpens,
      appOpens,
      webOpens,
      last24Hours,
      last7Days,
      last30Days,
    };
  }
}
