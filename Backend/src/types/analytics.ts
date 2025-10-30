// Page View Analytics Types

export interface PageViewRecord {
  id: string;
  page: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface PageViewCreateData {
  page: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface PageViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  topPages: PageViewsByPage[];
  viewsByDate: ViewsByDate[];
}

export interface PageViewsByPage {
  page: string;
  views: number;
  uniqueViews: number;
}

export interface ViewsByDate {
  date: string;
  views: number;
  uniqueViews: number;
}

export interface AnalyticsQuery {
  page?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  groupBy?: 'page' | 'day' | 'hour';
}

export interface PaginatedPageViews {
  pageViews: PageViewRecord[];
  total: number;
  hasMore: boolean;
}

export interface PopularPage {
  page: string;
  views: number;
}

export interface DashboardAnalytics {
  today: {
    views: number;
    uniqueViews: number;
  };
  yesterday: {
    views: number;
    uniqueViews: number;
  };
  thisWeek: {
    views: number;
    uniqueViews: number;
    viewsByDate: ViewsByDate[];
  };
  thisMonth: {
    views: number;
    uniqueViews: number;
  };
  popularToday: PopularPage[];
  popularWeek: PopularPage[];
  timestamp: string;
}

export interface PageStatsResponse {
  page: string;
  totalViews: number;
  uniqueViews: number;
  viewsByDate: ViewsByDate[];
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

export interface CleanupResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}

// Rate limiting types
export interface RateLimitEntry {
  count: number;
  firstRequest: Date;
}

export type RateLimitMap = Map<string, RateLimitEntry>;
