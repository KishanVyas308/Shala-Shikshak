export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Standard {
  id: string;
  name: string;
  description?: string;
  order: number;
  subjects?: Subject[];
  _count?: {
    subjects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  standardId: string;
  standard?: {
    id: string;
    name: string;
  };
  chapters?: Chapter[];
  _count?: {
    chapters: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChapterResource {
  id: string;
  title: string;
  description?: string;
  type: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType: 'video' | 'pdf';
  url: string;
  fileName?: string;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  subject?: {
    id: string;
    name: string;
    standard?: {
      id: string;
      name: string;
    };
  };
  resources?: ChapterResource[];
  _count?: {
    resources: number;
    svadhyayResources?: number;
    svadhyayPothiResources?: number;
    otherResources?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  admin: Admin;
}

export interface CreateStandardData {
  name: string;
  description?: string;
  order: number;
}

export interface CreateSubjectData {
  name: string;
  description?: string;
  standardId: string;
}

export interface CreateChapterData {
  name: string;
  description?: string;
  subjectId: string;
}

export interface CreateChapterResourceData {
  title: string;
  description?: string;
  type: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType: 'video' | 'pdf';
  url?: string;
  fileName?: string;
  chapterId: string;
}

export interface UploadResponse {
  message: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

// Analytics Types
export interface PageViewRecord {
  id: string;
  page: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface PageViewCreateData {
  page: string;
  userId?: string | null;
  userAgent?: string | null;
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

export interface PageViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  topPages: PageViewsByPage[];
  viewsByDate: ViewsByDate[];
}

export interface AnalyticsQuery {
  page?: string;
  startDate?: string;
  endDate?: string;
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

// Enhanced Analytics Types
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
