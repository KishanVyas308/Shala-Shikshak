import type { AnalyticsOverview, ViewsByDate, ContentAnalytics } from '../../types';
import type { ReactElement } from 'react';

export interface AnalyticsProps {
  overview: AnalyticsOverview;
  dailyData: ViewsByDate[];
  selectedPeriod: number;
  formatNumber: (num: number) => string;
  getGrowthIcon: (growth: number) => string;
  getTrendIcon: (trend: 'up' | 'down' | 'stable') => string;
  getTrendColor: (trend: 'up' | 'down' | 'stable') => string;
  chartColors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    fifth: string;
    sixth: string;
  };
}

export interface TabNavigationProps {
  activeTab: 'overview' | 'content' | 'time' | 'platform';
  setActiveTab: (tab: 'overview' | 'content' | 'time' | 'platform') => void;
}

export interface StatsCardsProps extends Pick<AnalyticsProps, 'overview' | 'formatNumber' | 'getGrowthIcon'> {}

export interface ChartsProps extends Pick<AnalyticsProps, 'overview' | 'dailyData' | 'selectedPeriod' | 'formatNumber' | 'chartColors'> {}

export interface ContentAnalyticsProps extends Pick<AnalyticsProps, 'overview' | 'formatNumber'> {
  expandedStandards: Set<string>;
  expandedSubjects: Set<string>;
  selectedContentView: 'hierarchy' | 'list';
  toggleStandardExpansion: (standardId: string) => void;
  toggleSubjectExpansion: (subjectId: string) => void;
  setSelectedContentView: (view: 'hierarchy' | 'list') => void;
  getHierarchicalData: () => any[];
  renderContentAnalytics: (title: string, data: ContentAnalytics[], color: string, platform?: 'web' | 'app') => ReactElement;
}

export interface TimeAnalyticsProps extends Pick<AnalyticsProps, 'overview' | 'formatNumber' | 'chartColors'> {}

export interface PlatformAnalyticsProps extends Pick<AnalyticsProps, 'overview' | 'formatNumber' | 'chartColors'> {}
