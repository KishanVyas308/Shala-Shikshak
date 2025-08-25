import { prisma } from '../lib/prisma';

export interface PageViewData {
  page: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  platform: 'web' | 'app';
}

export interface PageViewWithDetails {
  page: string;
  displayName: string;
  views: number;
  uniqueViews: number;
  entityType: 'standard' | 'subject' | 'chapter' | 'resource' | 'page' | 'home';
  entityId?: string;
  parentName?: string;
}

export interface AnalyticsOverview {
  totalViews: number;
  uniqueViews: number;
  topPages: PageViewWithDetails[];
  recentViews: number;
  growth: {
    viewsGrowth: number;
    uniqueViewsGrowth: number;
  };
  contentAnalytics: {
    standardsData: ContentAnalytics[];
    subjectsData: ContentAnalytics[];
    chaptersData: ContentAnalytics[];
  };
  timeAnalytics: {
    hourlyDistribution: HourlyData[];
    peakHours: { hour: number; views: number }[];
  };
  platformAnalytics: {
    webViews: number;
    appViews: number;
    webUniqueViews: number;
    appUniqueViews: number;
    platformDistribution: PlatformData[];
  };
}

export interface PlatformData {
  platform: 'web' | 'app';
  views: number;
  uniqueViews: number;
  percentage: number;
}

export interface ContentAnalytics {
  id: string;
  name: string;
  views: number;
  uniqueViews: number;
  parentName?: string;
  engagementRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface HourlyData {
  hour: number;
  views: number;
  label: string;
}

export class AnalyticsService {
  /**
   * Record a page view with IP tracking
   */
  static async recordPageView(data: PageViewData) {
    const normalizedPage = this.normalizePage(data.page);
    
    // Skip admin pages
    if (this.isAdminPage(normalizedPage)) {
      return null;
    }
    
    // Extract IP from userAgent or other source if needed
    const ipAddress = data.ipAddress || this.extractIPFromUserAgent(data.userAgent);
    
    return await prisma.pageView.create({
      data: {
        page: normalizedPage,
        userId: data.userId,
        ipAddress,
        userAgent: data.userAgent,
        platform: data.platform,
      },
    });
  }

  /**
   * Get analytics overview with meaningful page names
   */
  static async getAnalyticsOverview(days: number = 30): Promise<AnalyticsOverview> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    // Get current period stats
    const [currentViews, previousViews, recentViews] = await Promise.all([
      this.getViewsInPeriod(startDate, endDate),
      this.getViewsInPeriod(previousPeriodStart, startDate),
      this.getRecentViews(24), // Last 24 hours
    ]);

    // Get unique views (by IP)
    const [currentUniqueViews, previousUniqueViews] = await Promise.all([
      this.getUniqueViewsInPeriod(startDate, endDate),
      this.getUniqueViewsInPeriod(previousPeriodStart, startDate),
    ]);

    // Get top pages with details
    const topPages = await this.getTopPagesWithDetails(startDate, endDate, 10);

    // Get content analytics
    const [standardsData, subjectsData, chaptersData] = await Promise.all([
      this.getStandardsAnalytics(startDate, endDate),
      this.getSubjectsAnalytics(startDate, endDate),
      this.getChaptersAnalytics(startDate, endDate),
    ]);

    // Get time analytics
    const [hourlyDistribution, peakHours] = await Promise.all([
      this.getHourlyAnalytics(startDate, endDate),
      this.getPeakHours(startDate, endDate),
    ]);

    // Get platform analytics
    const platformAnalytics = await this.getPlatformAnalytics(startDate, endDate);

    // Calculate growth
    const viewsGrowth = previousViews > 0 
      ? ((currentViews - previousViews) / previousViews) * 100 
      : 0;
    
    const uniqueViewsGrowth = previousUniqueViews > 0 
      ? ((currentUniqueViews - previousUniqueViews) / previousUniqueViews) * 100 
      : 0;

    return {
      totalViews: currentViews,
      uniqueViews: currentUniqueViews,
      topPages,
      recentViews,
      growth: {
        viewsGrowth: Math.round(viewsGrowth * 100) / 100,
        uniqueViewsGrowth: Math.round(uniqueViewsGrowth * 100) / 100,
      },
      contentAnalytics: {
        standardsData,
        subjectsData,
        chaptersData,
      },
      timeAnalytics: {
        hourlyDistribution,
        peakHours,
      },
      platformAnalytics,
    };
  }

  /**
   * Get top pages with meaningful names and details
   */
  static async getTopPagesWithDetails(startDate: Date, endDate: Date, limit: number = 10): Promise<PageViewWithDetails[]> {
    // Get raw page view data
    const pageViews = await prisma.pageView.groupBy({
      by: ['page'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
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

    // Get unique views for each page
    const pagesWithDetails = await Promise.all(
      pageViews.map(async (pageData) => {
        const uniqueViews = await prisma.pageView.groupBy({
          by: ['ipAddress'],
          where: {
            page: pageData.page,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: {
            id: true,
          },
        });

        const pageDetails = await this.getPageDetails(pageData.page);
        
        return {
          page: pageData.page,
          displayName: pageDetails.displayName,
          views: pageData._count.id,
          uniqueViews: uniqueViews.length,
          entityType: pageDetails.entityType,
          entityId: pageDetails.entityId,
          parentName: pageDetails.parentName,
        };
      })
    );

    return pagesWithDetails;
  }

  /**
   * Get meaningful page details from URL
   */
  static async getPageDetails(page: string): Promise<{
    displayName: string;
    entityType: 'standard' | 'subject' | 'chapter' | 'resource' | 'page' | 'home';
    entityId?: string;
    parentName?: string;
  }> {
    // Normalize page
    const normalizedPage = this.normalizePage(page);

    // Home page
    if (normalizedPage === '/' || normalizedPage === '') {
      return {
        displayName: 'Home Page',
        entityType: 'home',
      };
    }

    // Standards page
    if (normalizedPage === '/standards') {
      return {
        displayName: 'Standards Page',
        entityType: 'page',
      };
    }

    // Standard view page
    const standardMatch = normalizedPage.match(/^\/standard\/(.+)$/);
    if (standardMatch) {
      const standardId = standardMatch[1];
      try {
        const standard = await prisma.standard.findUnique({
          where: { id: standardId },
        });
        return {
          displayName: standard ? `${standard.name} - Subjects` : `Standard ${standardId}`,
          entityType: 'standard',
          entityId: standardId,
        };
      } catch {
        return {
          displayName: `Standard ${standardId}`,
          entityType: 'standard',
          entityId: standardId,
        };
      }
    }

    // Subject view page
    const subjectMatch = normalizedPage.match(/^\/subject\/(.+)$/);
    if (subjectMatch) {
      const subjectId = subjectMatch[1];
      try {
        const subject = await prisma.subject.findUnique({
          where: { id: subjectId },
          include: {
            standard: true,
          },
        });
        return {
          displayName: subject ? `${subject.name} - Chapters` : `Subject ${subjectId}`,
          entityType: 'subject',
          entityId: subjectId,
          parentName: subject?.standard?.name,
        };
      } catch {
        return {
          displayName: `Subject ${subjectId}`,
          entityType: 'subject',
          entityId: subjectId,
        };
      }
    }

    // Chapter view page
    const chapterMatch = normalizedPage.match(/^\/chapter\/(.+)$/);
    if (chapterMatch) {
      const chapterId = chapterMatch[1];
      try {
        const chapter = await prisma.chapter.findUnique({
          where: { id: chapterId },
          include: {
            subject: {
              include: {
                standard: true,
              },
            },
          },
        });
        return {
          displayName: chapter ? `${chapter.name} - Resources` : `Chapter ${chapterId}`,
          entityType: 'chapter',
          entityId: chapterId,
          parentName: chapter ? `${chapter.subject.standard.name} > ${chapter.subject.name}` : undefined,
        };
      } catch {
        return {
          displayName: `Chapter ${chapterId}`,
          entityType: 'chapter',
          entityId: chapterId,
        };
      }
    }

    // PDF viewer or other specific pages
    if (normalizedPage.includes('/pdf-viewer')) {
      return {
        displayName: 'PDF Viewer',
        entityType: 'page',
      };
    }

    if (normalizedPage.includes('/bookmarks')) {
      return {
        displayName: 'Bookmarks',
        entityType: 'page',
      };
    }

    // Default fallback
    return {
      displayName: this.formatPageName(normalizedPage),
      entityType: 'page',
    };
  }

  /**
   * Get views in a specific period
   */
  private static async getViewsInPeriod(startDate: Date, endDate: Date): Promise<number> {
    return await prisma.pageView.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  /**
   * Get unique views in a specific period
   */
  private static async getUniqueViewsInPeriod(startDate: Date, endDate: Date): Promise<number> {
    const uniqueViews = await prisma.pageView.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });
    return uniqueViews.length;
  }

  /**
   * Get recent views (last N hours)
   */
  private static async getRecentViews(hours: number): Promise<number> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return await prisma.pageView.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });
  }

  /**
   * Check if a page is an admin page
   */
  private static isAdminPage(page: string): boolean {
    const adminPaths = [
      '/admin',
      '/login',
    ];
    
    return adminPaths.some(adminPath => 
      page === adminPath || page.startsWith(adminPath + '/')
    );
  }

  /**
   * Normalize page URL
   */
  private static normalizePage(page: string): string {
    // Remove query parameters and fragments
    let normalized = page.split('?')[0].split('#')[0];
    
    // Remove trailing slash except for root
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }

  /**
   * Format page name for display
   */
  private static formatPageName(page: string): string {
    return page
      .split('/')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '))
      .join(' > ') || 'Home';
  }

  /**
   * Extract IP from user agent or other sources (simple implementation)
   */
  private static extractIPFromUserAgent(userAgent?: string | null): string | null {
    // This is a placeholder - in real implementation, IP should come from request headers
    return null;
  }

  /**
   * Get daily analytics for charts
   */
  static async getDailyAnalytics(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyViews = await prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        ipAddress: true,
      },
    });

    // Group by day
    const grouped = dailyViews.reduce((acc, view) => {
      const day = view.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = {
          date: day,
          views: 0,
          uniqueViews: new Set<string>(),
        };
      }
      acc[day].views += 1;
      if (view.ipAddress) {
        acc[day].uniqueViews.add(view.ipAddress);
      }
      return acc;
    }, {} as Record<string, { date: string; views: number; uniqueViews: Set<string> }>);

    return Object.values(grouped).map(day => ({
      date: day.date,
      views: day.views,
      uniqueViews: day.uniqueViews.size,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get standards analytics
   */
  static async getStandardsAnalytics(startDate: Date, endDate: Date): Promise<ContentAnalytics[]> {
    try {
      const standards = await prisma.standard.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      const standardsAnalytics = await Promise.all(
        standards.map(async (standard) => {
          const standardViews = await prisma.pageView.findMany({
            where: {
              page: `/standard/${standard.id}`,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: {
              ipAddress: true,
            },
          });

          const views = standardViews.length;
          const uniqueViews = new Set(standardViews.map(v => v.ipAddress).filter(Boolean)).size;
          const engagementRate = views > 0 ? (uniqueViews / views) * 100 : 0;

          // Get previous period for trend
          const prevStart = new Date(startDate);
          prevStart.setDate(prevStart.getDate() - (endDate.getDate() - startDate.getDate()));
          const prevEnd = startDate;

          const prevViews = await prisma.pageView.count({
            where: {
              page: `/standard/${standard.id}`,
              createdAt: {
                gte: prevStart,
                lte: prevEnd,
              },
            },
          });

          const trend: 'up' | 'down' | 'stable' = 
            views > prevViews ? 'up' : views < prevViews ? 'down' : 'stable';

          return {
            id: standard.id,
            name: standard.name,
            views,
            uniqueViews,
            engagementRate: Math.round(engagementRate * 100) / 100,
            trend,
          };
        })
      );

      return standardsAnalytics
        .filter(s => s.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting standards analytics:', error);
      return [];
    }
  }

  /**
   * Get subjects analytics
   */
  static async getSubjectsAnalytics(startDate: Date, endDate: Date): Promise<ContentAnalytics[]> {
    try {
      const subjects = await prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          standard: {
            select: {
              name: true,
            },
          },
        },
      });

      const subjectsAnalytics = await Promise.all(
        subjects.map(async (subject) => {
          const subjectViews = await prisma.pageView.findMany({
            where: {
              page: `/subject/${subject.id}`,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: {
              ipAddress: true,
            },
          });

          const views = subjectViews.length;
          const uniqueViews = new Set(subjectViews.map(v => v.ipAddress).filter(Boolean)).size;
          const engagementRate = views > 0 ? (uniqueViews / views) * 100 : 0;

          // Get previous period for trend
          const prevStart = new Date(startDate);
          prevStart.setDate(prevStart.getDate() - (endDate.getDate() - startDate.getDate()));
          const prevEnd = startDate;

          const prevViews = await prisma.pageView.count({
            where: {
              page: `/subject/${subject.id}`,
              createdAt: {
                gte: prevStart,
                lte: prevEnd,
              },
            },
          });

          const trend: 'up' | 'down' | 'stable' = 
            views > prevViews ? 'up' : views < prevViews ? 'down' : 'stable';

          return {
            id: subject.id,
            name: subject.name,
            views,
            uniqueViews,
            parentName: subject.standard.name,
            engagementRate: Math.round(engagementRate * 100) / 100,
            trend,
          };
        })
      );

      return subjectsAnalytics
        .filter(s => s.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting subjects analytics:', error);
      return [];
    }
  }

  /**
   * Get chapters analytics
   */
  static async getChaptersAnalytics(startDate: Date, endDate: Date): Promise<ContentAnalytics[]> {
    try {
      const chapters = await prisma.chapter.findMany({
        select: {
          id: true,
          name: true,
          subject: {
            select: {
              name: true,
              standard: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const chaptersAnalytics = await Promise.all(
        chapters.map(async (chapter) => {
          const chapterViews = await prisma.pageView.findMany({
            where: {
              page: `/chapter/${chapter.id}`,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: {
              ipAddress: true,
            },
          });

          const views = chapterViews.length;
          const uniqueViews = new Set(chapterViews.map(v => v.ipAddress).filter(Boolean)).size;
          const engagementRate = views > 0 ? (uniqueViews / views) * 100 : 0;

          // Get previous period for trend
          const prevStart = new Date(startDate);
          prevStart.setDate(prevStart.getDate() - (endDate.getDate() - startDate.getDate()));
          const prevEnd = startDate;

          const prevViews = await prisma.pageView.count({
            where: {
              page: `/chapter/${chapter.id}`,
              createdAt: {
                gte: prevStart,
                lte: prevEnd,
              },
            },
          });

          const trend: 'up' | 'down' | 'stable' = 
            views > prevViews ? 'up' : views < prevViews ? 'down' : 'stable';

          return {
            id: chapter.id,
            name: chapter.name,
            views,
            uniqueViews,
            parentName: `${chapter.subject.standard.name} > ${chapter.subject.name}`,
            engagementRate: Math.round(engagementRate * 100) / 100,
            trend,
          };
        })
      );

      return chaptersAnalytics
        .filter(c => c.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting chapters analytics:', error);
      return [];
    }
  }

  /**
   * Get hourly analytics
   */
  static async getHourlyAnalytics(startDate: Date, endDate: Date): Promise<HourlyData[]> {
    try {
      const pageViews = await prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      });

      const hourlyData: Record<number, number> = {};
      
      // Initialize all hours
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = 0;
      }

      // Count views by hour
      pageViews.forEach(view => {
        const hour = view.createdAt.getHours();
        hourlyData[hour]++;
      });

      return Object.entries(hourlyData).map(([hour, views]) => ({
        hour: parseInt(hour),
        views,
        label: `${hour.padStart(2, '0')}:00`,
      }));
    } catch (error) {
      console.error('Error getting hourly analytics:', error);
      return [];
    }
  }

  /**
   * Get peak hours
   */
  static async getPeakHours(startDate: Date, endDate: Date): Promise<{ hour: number; views: number }[]> {
    try {
      const hourlyData = await this.getHourlyAnalytics(startDate, endDate);
      return hourlyData
        .sort((a, b) => b.views - a.views)
        .slice(0, 3)
        .map(h => ({ hour: h.hour, views: h.views }));
    } catch (error) {
      console.error('Error getting peak hours:', error);
      return [];
    }
  }

  /**
   * Get platform analytics
   */
  static async getPlatformAnalytics(startDate: Date, endDate: Date): Promise<{
    webViews: number;
    appViews: number;
    webUniqueViews: number;
    appUniqueViews: number;
    platformDistribution: PlatformData[];
  }> {
    try {
      // Get web views
      const webViews = await prisma.pageView.count({
        where: {
          platform: 'web',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Get app views
      const appViews = await prisma.pageView.count({
        where: {
          platform: 'app',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Get unique web visitors
      const webUniqueViewsData = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          platform: 'web',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Get unique app visitors
      const appUniqueViewsData = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          platform: 'app',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const webUniqueViews = webUniqueViewsData.length;
      const appUniqueViews = appUniqueViewsData.length;
      const totalViews = webViews + appViews;

      const platformDistribution: PlatformData[] = [
        {
          platform: 'web',
          views: webViews,
          uniqueViews: webUniqueViews,
          percentage: totalViews > 0 ? Math.round((webViews / totalViews) * 100 * 100) / 100 : 0,
        },
        {
          platform: 'app',
          views: appViews,
          uniqueViews: appUniqueViews,
          percentage: totalViews > 0 ? Math.round((appViews / totalViews) * 100 * 100) / 100 : 0,
        },
      ];

      return {
        webViews,
        appViews,
        webUniqueViews,
        appUniqueViews,
        platformDistribution,
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      return {
        webViews: 0,
        appViews: 0,
        webUniqueViews: 0,
        appUniqueViews: 0,
        platformDistribution: [],
      };
    }
  }
}
