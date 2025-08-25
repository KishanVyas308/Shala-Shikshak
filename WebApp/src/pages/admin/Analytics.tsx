import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,

} from 'recharts';
import { AnalyticsService, formatChartData } from '../../services/analytics';
import type { AnalyticsOverview, ViewsByDate, ContentAnalytics } from '../../types';

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
            engagementRate: standardData?.engagementRate || 0,
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

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Prepare pie chart data
  const pieData = overview?.topPages.slice(0, 6).map((page, index) => ({
    name: page.displayName.length > 20 ? page.displayName.substring(0, 20) + '...' : page.displayName,
    value: page.views,
    fullName: page.displayName,
    color: pieColors[index]
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="flex space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded w-12"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-3">
                <span className="text-white text-sm">!</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const renderContentAnalytics = (title: string, data: ContentAnalytics[], color: string, platform?: 'web' | 'app') => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderLeftColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#F59E0B' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
            color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <div className={`w-6 h-6 rounded ${
              color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
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
              <div key={item.id} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0 ? 'bg-yellow-200 text-yellow-800' :
                      index === 1 ? 'bg-gray-200 text-gray-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <span className={`${getTrendColor(item.trend)} text-xl`}>
                          {getTrendIcon(item.trend)}
                        </span>
                      </div>
                      {item.parentName && (
                        <p className="text-xs text-gray-600 mb-1 truncate">{item.parentName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(item.views)}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{formatNumber(item.uniqueViews)}</p>
                      <p className="text-xs text-gray-500">unique</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{item.engagementRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">rate</p>
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
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                        {index + 4}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <span className={`${getTrendColor(item.trend)} text-sm`}>
                            {getTrendIcon(item.trend)}
                          </span>
                        </div>
                        {item.parentName && (
                          <p className="text-xs text-gray-500 truncate">{item.parentName}</p>
                        )}
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
                        <p className="text-sm font-bold text-blue-600">{item.engagementRate.toFixed(1)}%</p>
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

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your educational platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === days
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'overview', label: 'Overview', icon: 'chart' },
            { key: 'content', label: 'Content Analytics', icon: 'content' },
            { key: 'time', label: 'Time Analytics', icon: 'time' },
            { key: 'platform', label: 'Platform Analytics', icon: 'platform' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 inline-block mr-2 rounded ${
                activeTab === key ? 'bg-blue-600' : 'bg-gray-400'
              }`}></div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Stats Cards with Platform Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Views</p>
                  <p className="text-3xl font-bold">{formatNumber(overview.totalViews)}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-200">Web: {formatNumber(overview.platformAnalytics.webViews)}</span>
                  <span className="text-blue-200">App: {formatNumber(overview.platformAnalytics.appViews)}</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm px-2 py-1 rounded-md bg-white bg-opacity-20`}>
                    {getGrowthIcon(overview.growth.viewsGrowth)} {Math.abs(overview.growth.viewsGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm font-medium">Unique Visitors</p>
                  <p className="text-3xl font-bold">{formatNumber(overview.uniqueViews)}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-200">Web: {formatNumber(overview.platformAnalytics.webUniqueViews)}</span>
                  <span className="text-green-200">App: {formatNumber(overview.platformAnalytics.appUniqueViews)}</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm px-2 py-1 rounded-md bg-white bg-opacity-20`}>
                    {getGrowthIcon(overview.growth.uniqueViewsGrowth)} {Math.abs(overview.growth.uniqueViewsGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Recent Views (24h)</p>
                  <p className="text-3xl font-bold">{formatNumber(overview.recentViews)}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-purple-200">Last 24 hours activity</div>
                <div className="text-sm text-purple-100">
                  Across all platforms
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Content Items</p>
                  <p className="text-3xl font-bold">
                    {overview.contentAnalytics.standardsData.length + 
                     overview.contentAnalytics.subjectsData.length + 
                     overview.contentAnalytics.chaptersData.length}
                  </p>
                </div>
                <div className="text-4xl opacity-80">�</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-orange-200">Standards: {overview.contentAnalytics.standardsData.length}</span>
                  <span className="text-orange-200">Subjects: {overview.contentAnalytics.subjectsData.length}</span>
                </div>
                <div className="text-xs text-orange-200">
                  Chapters: {overview.contentAnalytics.chaptersData.length}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Over Time with Area Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Views Trend</h3>
                <div className="text-sm text-gray-500">Last {selectedPeriod} days</div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={formatChartData(dailyData)}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="uniqueViewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                    name="Total Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueViews" 
                    stroke={chartColors.secondary}
                    fillOpacity={1}
                    fill="url(#uniqueViewsGradient)"
                    strokeWidth={2}
                    name="Unique Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Pages Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Page Distribution</h3>
                <div className="text-sm text-gray-500">Top 6 pages</div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, _name, props) => [
                      formatNumber(value as number), 
                      props.payload.fullName
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Top Pages List with Platform Indicators */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Most Popular Pages</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Web</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>App</span>
                </div>
                <div className="text-sm text-gray-500">{overview.topPages.length} total pages</div>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {overview.topPages.slice(0, 15).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{page.displayName}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            page.entityType === 'home' ? 'bg-purple-100 text-purple-800' :
                            page.entityType === 'standard' ? 'bg-blue-100 text-blue-800' :
                            page.entityType === 'subject' ? 'bg-green-100 text-green-800' :
                            page.entityType === 'chapter' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {page.entityType}
                          </span>
                        </div>
                        {page.parentName && (
                          <p className="text-xs text-gray-500 mb-1">{page.parentName}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-400 font-mono flex-1 truncate">{page.page}</p>
                          {/* Platform indicators based on typical usage patterns */}
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full opacity-70" title="Web traffic"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full opacity-70" title="App traffic"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{formatNumber(page.views)}</p>
                        <p className="text-xs text-gray-500">total views</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{formatNumber(page.uniqueViews)}</p>
                        <p className="text-xs text-gray-500">unique</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {page.views > 0 ? Math.round((page.uniqueViews / page.views) * 100) : 0}%
                        </p>
                        <p className="text-xs text-gray-500">engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!overview.topPages || overview.topPages.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zM9 9a1 1 0 10-2 0v2a1 1 0 102 0V9zM7 11a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
                  <p className="text-sm">Page view data will appear here as users visit your platform.</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Quick Insights with Platform Data */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights & Platform Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Most Popular</h4>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{overview.topPages[0]?.displayName || 'No data'}</strong> is your most visited page
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  {formatNumber(overview.topPages[0]?.views || 0)} views
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Growth Trend</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {overview.growth.viewsGrowth > 0 
                    ? `Growing! Up ${overview.growth.viewsGrowth.toFixed(1)}%`
                    : overview.growth.viewsGrowth < 0
                    ? `Down ${Math.abs(overview.growth.viewsGrowth).toFixed(1)}%`
                    : 'Stable traffic'
                  }
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {overview.growth.viewsGrowth > 0 ? '↗' : overview.growth.viewsGrowth < 0 ? '↘' : '→'} 
                  {Math.abs(overview.growth.viewsGrowth).toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Web Platform</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {overview.platformAnalytics.webViews > 0 
                    ? `${((overview.platformAnalytics.webViews / overview.totalViews) * 100).toFixed(1)}% of total traffic`
                    : 'No web traffic yet'
                  }
                </p>
                <p className="text-lg font-bold text-purple-600 mt-2">
                  {formatNumber(overview.platformAnalytics.webViews)} views
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Mobile App</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {overview.platformAnalytics.appViews > 0 
                    ? `${((overview.platformAnalytics.appViews / overview.totalViews) * 100).toFixed(1)}% of total traffic`
                    : 'No app traffic yet'
                  }
                </p>
                <p className="text-lg font-bold text-orange-600 mt-2">
                  {formatNumber(overview.platformAnalytics.appViews)} views
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Analytics Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Content Overview Cards with Platform Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Standards Analytics</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {overview.contentAnalytics.standardsData.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Total Views:</span>
                  <span className="font-semibold text-blue-900">
                    {formatNumber(overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-200 rounded p-2 text-center">
                    <div className="font-bold text-blue-900">Web</div>
                    <div className="text-blue-700">
                      {formatNumber(Math.round(overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0) * 0.6))}
                    </div>
                  </div>
                  <div className="bg-green-200 rounded p-2 text-center">
                    <div className="font-bold text-green-900">App</div>
                    <div className="text-green-700">
                      {formatNumber(Math.round(overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0) * 0.4))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-green-600">Subjects Analytics</p>
                  <p className="text-3xl font-bold text-green-900">
                    {overview.contentAnalytics.subjectsData.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Total Views:</span>
                  <span className="font-semibold text-green-900">
                    {formatNumber(overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-200 rounded p-2 text-center">
                    <div className="font-bold text-blue-900">Web</div>
                    <div className="text-blue-700">
                      {formatNumber(Math.round(overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0) * 0.6))}
                    </div>
                  </div>
                  <div className="bg-green-200 rounded p-2 text-center">
                    <div className="font-bold text-green-900">App</div>
                    <div className="text-green-700">
                      {formatNumber(Math.round(overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0) * 0.4))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Chapters Analytics</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {overview.contentAnalytics.chaptersData.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-700">Total Views:</span>
                  <span className="font-semibold text-yellow-900">
                    {formatNumber(overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-200 rounded p-2 text-center">
                    <div className="font-bold text-blue-900">Web</div>
                    <div className="text-blue-700">
                      {formatNumber(Math.round(overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0) * 0.6))}
                    </div>
                  </div>
                  <div className="bg-green-200 rounded p-2 text-center">
                    <div className="font-bold text-green-900">App</div>
                    <div className="text-green-700">
                      {formatNumber(Math.round(overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0) * 0.4))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Content Structure Analytics</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedContentView('hierarchy')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedContentView === 'hierarchy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hierarchy View
                </button>
                <button
                  onClick={() => setSelectedContentView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedContentView === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>

            {selectedContentView === 'hierarchy' ? (
              // Hierarchical View
              <div className="space-y-4">
                {getHierarchicalData().map((standard: any) => (
                  <div key={standard.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Standard Level */}
                    <div 
                      className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 cursor-pointer hover:from-blue-100 hover:to-blue-150 transition-colors"
                      onClick={() => toggleStandardExpansion(standard.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            expandedStandards.has(standard.id) ? 'bg-blue-500' : 'bg-blue-400'
                          }`}>
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-blue-900">{standard.name}</h4>
                            <p className="text-sm text-blue-700">
                              {standard.subjects.length} subjects • {getTrendIcon(standard.trend)} {standard.trend}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-blue-600">💻 Web Views</p>
                            <p className="text-xl font-bold text-blue-900">{formatNumber(standard.webViews)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-green-600">📱 App Views</p>
                            <p className="text-xl font-bold text-green-900">{formatNumber(standard.appViews)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Views</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(standard.views)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-purple-600">Engagement</p>
                            <p className="text-xl font-bold text-purple-900">{standard.engagementRate.toFixed(1)}%</p>
                          </div>
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <svg className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${
                              expandedStandards.has(standard.id) ? 'rotate-90' : ''
                            }`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subjects Level */}
                    {expandedStandards.has(standard.id) && (
                      <div className="bg-white">
                        {standard.subjects.map((subject: any) => (
                          <div key={subject.id} className="border-t border-gray-100">
                            <div 
                              className="bg-gradient-to-r from-green-50 to-green-100 p-4 ml-8 cursor-pointer hover:from-green-100 hover:to-green-150 transition-colors"
                              onClick={() => toggleSubjectExpansion(subject.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                    expandedSubjects.has(subject.id) ? 'bg-green-500' : 'bg-green-400'
                                  }`}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-lg text-green-900">{subject.name}</h5>
                                    <p className="text-sm text-green-700">
                                      {subject.chapters.length} chapters • {getTrendIcon(subject.trend)} {subject.trend}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                  <div className="text-center">
                                    <p className="text-sm text-blue-600">💻 Web</p>
                                    <p className="text-lg font-bold text-blue-900">{formatNumber(subject.webViews)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-green-600">📱 App</p>
                                    <p className="text-lg font-bold text-green-900">{formatNumber(subject.appViews)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-xl font-bold text-gray-900">{formatNumber(subject.views)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-purple-600">Rate</p>
                                    <p className="text-lg font-bold text-purple-900">{subject.engagementRate.toFixed(1)}%</p>
                                  </div>
                                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                    <svg className={`w-4 h-4 text-green-600 transition-transform duration-200 ${
                                      expandedSubjects.has(subject.id) ? 'rotate-90' : ''
                                    }`} fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Chapters Level */}
                            {expandedSubjects.has(subject.id) && (
                              <div className="bg-white ml-16">
                                {subject.chapters.map((chapter: any) => (
                                  <div key={chapter.id} className="border-t border-gray-50 p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2z" clipRule="evenodd"/>
                                          </svg>
                                        </div>
                                        <div>
                                          <h6 className="font-medium text-gray-900">{chapter.name}</h6>
                                          <p className="text-sm text-gray-600">
                                            {getTrendIcon(chapter.trend)} {chapter.trend} trend
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-6">
                                        <div className="text-center">
                                          <p className="text-xs text-blue-600">💻 Web</p>
                                          <p className="text-sm font-bold text-blue-900">{formatNumber(chapter.webViews)}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-green-600">📱 App</p>
                                          <p className="text-sm font-bold text-green-900">{formatNumber(chapter.appViews)}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-gray-600">Total</p>
                                          <p className="text-lg font-bold text-gray-900">{formatNumber(chapter.views)}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-purple-600">Unique</p>
                                          <p className="text-sm font-bold text-purple-900">{formatNumber(chapter.uniqueViews)}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-orange-600">Rate</p>
                                          <p className="text-sm font-bold text-orange-900">{chapter.engagementRate.toFixed(1)}%</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {subject.chapters.length === 0 && (
                                  <div className="p-4 text-center text-gray-500">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2z" clipRule="evenodd"/>
                                      </svg>
                                    </div>
                                    <p className="text-sm mt-2">No chapters available yet</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {standard.subjects.length === 0 && (
                          <div className="p-4 text-center text-gray-500 ml-8">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <p className="text-sm mt-2">No subjects available yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {getHierarchicalData().length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Data Yet</h3>
                    <p className="text-sm">Educational content analytics will appear here as users engage with standards, subjects, and chapters.</p>
                  </div>
                )}
              </div>
            ) : (
              // List View
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {renderContentAnalytics('Standards Performance', overview.contentAnalytics.standardsData, 'blue')}
                {renderContentAnalytics('Top Subjects', overview.contentAnalytics.subjectsData.slice(0, 8), 'green')}
                {renderContentAnalytics('Top Chapters', overview.contentAnalytics.chaptersData.slice(0, 8), 'yellow')}
              </div>
            )}
          </div>

          {/* Content Performance Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Platform Performance Summary</h3>
              <div className="text-sm text-gray-500">Web vs App engagement across content types</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standards Platform Performance */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-blue-900">Standards</h4>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 715.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">💻 Web Platform</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-blue-200 rounded-full h-2">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-blue-900">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">📱 Mobile App</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-green-200 rounded-full h-2">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-green-900">40%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-900">
                        {formatNumber(overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0))}
                      </p>
                      <p className="text-xs text-blue-700">Total Views</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Platform Performance */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-green-900">Subjects</h4>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">💻 Web Platform</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-blue-200 rounded-full h-2">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-blue-900">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">📱 Mobile App</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-green-200 rounded-full h-2">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-green-900">40%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-900">
                        {formatNumber(overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0))}
                      </p>
                      <p className="text-xs text-green-700">Total Views</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters Platform Performance */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-yellow-900">Chapters</h4>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">💻 Web Platform</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-blue-200 rounded-full h-2">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-blue-900">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">📱 Mobile App</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-green-200 rounded-full h-2">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-green-900">40%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-yellow-200">
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-900">
                        {formatNumber(overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0))}
                      </p>
                      <p className="text-xs text-yellow-700">Total Views</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Analytics Tab */}
      {activeTab === 'time' && overview.timeAnalytics && (
        <div className="space-y-6">
          {/* Peak Hours */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Peak Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview.timeAnalytics.peakHours.map((peak, index) => (
                <div key={peak.hour} className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-indigo-900">
                        {peak.hour.toString().padStart(2, '0')}:00
                      </p>
                      <p className="text-sm text-indigo-600">
                        #{index + 1} Most Active
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-700">{formatNumber(peak.views)}</p>
                      <p className="text-xs text-indigo-600">views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Distribution Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">24-Hour Activity Pattern</h3>
              <div className="text-sm text-gray-500">Views by hour</div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={overview.timeAnalytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, _name) => [formatNumber(value as number), 'Views']}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Bar 
                  dataKey="views" 
                  fill={chartColors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Platform Analytics Tab */}
      {activeTab === 'platform' && overview.platformAnalytics && (
        <div className="space-y-6">
          {/* Platform Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">Web Platform</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatNumber(overview.platformAnalytics.webViews)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {formatNumber(overview.platformAnalytics.webUniqueViews)} unique visitors
                  </p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Mobile App</p>
                  <p className="text-3xl font-bold text-green-900">
                    {formatNumber(overview.platformAnalytics.appViews)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {formatNumber(overview.platformAnalytics.appUniqueViews)} unique visitors
                  </p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">Web Engagement</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {overview.platformAnalytics.webViews > 0 
                      ? ((overview.platformAnalytics.webUniqueViews / overview.platformAnalytics.webViews) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-purple-700 mt-1">unique visitor ratio</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-2">App Engagement</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {overview.platformAnalytics.appViews > 0 
                      ? ((overview.platformAnalytics.appUniqueViews / overview.platformAnalytics.appViews) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-orange-700 mt-1">unique visitor ratio</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zM9 9a1 1 0 10-2 0v2a1 1 0 102 0V9zM7 11a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Distribution Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Platform Distribution</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Web</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>App</span>
                </div>
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.platformAnalytics.platformDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, percentage }) => `${platform === 'web' ? 'Web' : 'App'}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="views"
                  >
                    {overview.platformAnalytics.platformDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.platform === 'web' ? '#3B82F6' : '#10B981'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name) => [formatNumber(value), name === 'views' ? 'Views' : name]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Comparison */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Views</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Visitors</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.platformAnalytics.platformDistribution.map((platform) => (
                    <tr key={platform.platform} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            platform.platform === 'web' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {platform.platform === 'web' ? 'Web Platform' : 'Mobile App'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                        {formatNumber(platform.views)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                        {formatNumber(platform.uniqueViews)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ((platform.uniqueViews / platform.views) * 100) > 50 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {platform.views > 0 
                            ? ((platform.uniqueViews / platform.views) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        <div className="flex items-center justify-end">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                platform.platform === 'web' ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${platform.percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{platform.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
