import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../../services/analytics';
import type { AnalyticsOverview, ViewsByDate, ContentAnalytics } from '../../types';
import {
  AnalyticsHeader,
  TabNavigation,
  OverviewTab,
  ContentAnalyticsTab,
  TimeAnalyticsTab,
  PlatformAnalyticsTab,
  LoadingState,
  ErrorState,
} from '../../components/analytics';

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<ViewsByDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'time' | 'platform'>('overview');
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [selectedContentView, setSelectedContentView] = useState<'hierarchy' | 'list'>('hierarchy');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, refreshKey]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, dailyAnalytics] = await Promise.all([
        AnalyticsService.getAnalyticsOverview(selectedPeriod),
        AnalyticsService.getDailyAnalytics(selectedPeriod)
      ]);

      setOverview(overviewData);
      setDailyData(dailyAnalytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Utility functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const toggleStandardExpansion = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  const toggleSubjectExpansion = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  // Group content data by hierarchy
  const getHierarchicalData = () => {
    if (!overview) return [];

    const standardsMap = new Map();

    // Group subjects by standard
    overview.contentAnalytics.subjectsData.forEach(subject => {
      if (subject.parentName) {
        if (!standardsMap.has(subject.parentName)) {
          const standardData = overview.contentAnalytics.standardsData.find(s => s.name === subject.parentName);
          standardsMap.set(subject.parentName, {
            id: standardData?.id || subject.parentName,
            name: subject.parentName,
            views: standardData?.views || 0,
            uniqueViews: standardData?.uniqueViews || 0,
            trend: standardData?.trend || 'stable',
            subjects: [],
            webViews: Math.round((standardData?.views || 0) * 0.6), // Estimated split
            appViews: Math.round((standardData?.views || 0) * 0.4)
          });
        }
        standardsMap.get(subject.parentName).subjects.push({
          ...subject,
          chapters: [],
          webViews: Math.round(subject.views * 0.6),
          appViews: Math.round(subject.views * 0.4)
        });
      }
    });

    // Group chapters by subject
    overview.contentAnalytics.chaptersData.forEach(chapter => {
      if (chapter.parentName) {
        const [standardName, subjectName] = chapter.parentName.split(' > ');
        const standard = standardsMap.get(standardName);
        if (standard) {
          const subject = standard.subjects.find((s: any) => s.name === subjectName);
          if (subject) {
            subject.chapters.push({
              ...chapter,
              webViews: Math.round(chapter.views * 0.6),
              appViews: Math.round(chapter.views * 0.4)
            });
          }
        }
      }
    });

    return Array.from(standardsMap.values());
  };

  // Colors for charts
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    fifth: '#8B5CF6',
    sixth: '#06B6D4'
  };

  const renderContentAnalytics = (title: string, data: ContentAnalytics[], color: string, platform?: 'web' | 'app') => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderLeftColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#F59E0B' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
            <div className={`w-6 h-6 rounded ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {platform && (
              <p className="text-sm text-gray-500">
                {platform === 'web' ? 'Web Platform' : 'Mobile App'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">{data.length} total</div>
          <div className="text-lg font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.views, 0).toLocaleString()} views
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-2">
          {/* Top 3 performers */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {data.slice(0, 3).map((item, index) => (
              <div key={item.id} className={`p-4 rounded-lg border-2 ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                    'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatNumber(item.views)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-600">{formatNumber(item.uniqueViews)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-600">{getTrendIcon(item.trend)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed list with better layout */}
          {data.length > 3 && (
            <div className="max-h-80 overflow-y-auto border-t pt-4">
              <div className="space-y-2">
                {data.slice(3).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 4}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{formatNumber(item.views)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-600">{formatNumber(item.uniqueViews)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-600">{getTrendIcon(item.trend)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {title} Data Yet</h3>
          <p className="text-sm">Analytics will appear here as users engage with {title.toLowerCase()}.</p>
        </div>
      )}
    </div>
  );

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  // Show empty state
  if (!overview) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Header */}
        <AnalyticsHeader
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          handleRefresh={handleRefresh}
        />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            overview={overview}
            dailyData={dailyData}
            selectedPeriod={selectedPeriod}
            formatNumber={formatNumber}
            getGrowthIcon={getGrowthIcon}
            getTrendIcon={getTrendIcon}
            getTrendColor={getTrendColor}
            chartColors={chartColors}
          />
        )}

        {activeTab === 'content' && (
          <ContentAnalyticsTab
            overview={overview}
            formatNumber={formatNumber}
            expandedStandards={expandedStandards}
            expandedSubjects={expandedSubjects}
            selectedContentView={selectedContentView}
            toggleStandardExpansion={toggleStandardExpansion}
            toggleSubjectExpansion={toggleSubjectExpansion}
            setSelectedContentView={setSelectedContentView}
            getHierarchicalData={getHierarchicalData}
            renderContentAnalytics={renderContentAnalytics}
          />
        )}

        {activeTab === 'time' && overview.timeAnalytics && (
          <TimeAnalyticsTab
            overview={overview}
            formatNumber={formatNumber}
            chartColors={chartColors}
          />
        )}

        {activeTab === 'platform' && overview.platformAnalytics && (
          <PlatformAnalyticsTab
            overview={overview}
            formatNumber={formatNumber}
            chartColors={chartColors}
          />
        )}
      </div>
    </div>
  );
};

export default Analytics;
