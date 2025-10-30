import { prisma } from '../lib/prisma';

export interface PageViewData {
  page: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface PageViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  viewsByDate: Array<{
    date: string;
    views: number;
    uniqueViews: number;
  }>;
}

export interface AnalyticsQuery {
  page?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  groupBy?: 'page' | 'day' | 'hour';
}

export class PageViewService {
  /**
   * Record a page view
   */
  static async recordPageView(data: PageViewData) {
    return await prisma.pageView.create({
      data: {
        page: data.page,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Get page view analytics
   */
  static async getAnalytics(query: AnalyticsQuery): Promise<PageViewAnalytics> {
    const { page, startDate, endDate, groupBy } = query;

    // Build where clause
    const whereClause: any = {};
    if (page) {
      whereClause.page = page;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = startDate;
      }
      if (endDate) {
        whereClause.createdAt.lte = endDate;
      }
    }

    // Get total views
    const totalViews = await prisma.pageView.count({
      where: whereClause,
    });

    // Get unique views (by IP address)
    const uniqueViewsResult = await prisma.pageView.groupBy({
      by: ['ipAddress'],
      where: whereClause,
      _count: {
        id: true,
      },
    });
    const uniqueViews = uniqueViewsResult.length;

    // Get top pages
    const topPagesData = await prisma.pageView.groupBy({
      by: ['page'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get unique views for each top page
    const topPages = await Promise.all(
      topPagesData.map(async (pageData) => {
        const uniquePageViews = await prisma.pageView.groupBy({
          by: ['ipAddress'],
          where: {
            ...whereClause,
            page: pageData.page,
          },
          _count: {
            id: true,
          },
        });

        return {
          page: pageData.page,
          views: pageData._count.id,
          uniqueViews: uniquePageViews.length,
        };
      })
    );

    // Get views by date
    let viewsByDate: Array<{ date: string; views: number; uniqueViews: number }> = [];
    
    if (groupBy === 'day' || groupBy === 'hour') {
      // Simplified approach: fetch recent views and group in JavaScript
      const recentViews = await prisma.pageView.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          ipAddress: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10000, // Limit for performance
      });
      
      // Group by date in JavaScript
      const grouped = recentViews.reduce((acc, view) => {
        const dateKey = groupBy === 'day' 
          ? view.createdAt.toISOString().split('T')[0]
          : view.createdAt.toISOString().substring(0, 13) + ':00:00';
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            views: 0,
            uniqueIPs: new Set<string>(),
          };
        }
        
        acc[dateKey].views += 1;
        if (view.ipAddress) {
          acc[dateKey].uniqueIPs.add(view.ipAddress);
        }
        
        return acc;
      }, {} as Record<string, { views: number; uniqueIPs: Set<string> }>);
      
      viewsByDate = Object.entries(grouped)
        .map(([date, data]) => ({
          date,
          views: data.views,
          uniqueViews: data.uniqueIPs.size,
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);
    }

    return {
      totalViews,
      uniqueViews,
      topPages,
      viewsByDate,
    };
  }

  /**
   * Get page views with pagination
   */
  static async getPageViews(query: AnalyticsQuery) {
    const { page, startDate, endDate, limit = 50, offset = 0 } = query;

    // Build where clause
    const whereClause: any = {};
    if (page) {
      whereClause.page = page;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = startDate;
      }
      if (endDate) {
        whereClause.createdAt.lte = endDate;
      }
    }

    const [pageViews, total] = await Promise.all([
      prisma.pageView.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.pageView.count({
        where: whereClause,
      }),
    ]);

    return {
      pageViews,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get popular pages
   */
  static async getPopularPages(limit: number = 10, timeRange?: { startDate: Date; endDate: Date }) {
    const whereClause: any = {};
    if (timeRange) {
      whereClause.createdAt = {
        gte: timeRange.startDate,
        lte: timeRange.endDate,
      };
    }

    const popularPages = await prisma.pageView.groupBy({
      by: ['page'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return popularPages.map(page => ({
      page: page.page,
      views: page._count.id,
    }));
  }

  /**
   * Delete old page views (for data cleanup)
   */
  static async deleteOldPageViews(olderThanDays: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.pageView.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
