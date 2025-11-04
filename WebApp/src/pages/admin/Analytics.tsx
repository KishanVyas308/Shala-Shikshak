import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../../services/analytics';

interface SimpleStats {
  totalOpens: number;
  appOpens: number;
  webOpens: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<SimpleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getSimpleStats();
      setStats(data);
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600">{error || 'Failed to load data'}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">App & Website open statistics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Opens */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Opens</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalOpens)}</div>
        </div>

        {/* App Opens */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">App Opens</h3>
            <span className="text-2xl">📱</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{formatNumber(stats.appOpens)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.totalOpens > 0 ? Math.round((stats.appOpens / stats.totalOpens) * 100) : 0}% of total
          </div>
        </div>

        {/* Web Opens */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Website Opens</h3>
            <span className="text-2xl">🌐</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{formatNumber(stats.webOpens)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.totalOpens > 0 ? Math.round((stats.webOpens / stats.totalOpens) * 100) : 0}% of total
          </div>
        </div>

        {/* Last 24 Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Last 24 Hours</h3>
            <span className="text-2xl">⏰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.last24Hours)}</div>
        </div>

        {/* Last 7 Days */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Last 7 Days</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.last7Days)}</div>
        </div>

        {/* Last 30 Days */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Last 30 Days</h3>
            <span className="text-2xl">📆</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.last30Days)}</div>
        </div>
      </div>

      {/* Platform Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Distribution</h2>
        <div className="space-y-4">
          {/* App Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">📱 Mobile App</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(stats.appOpens)} 
                ({stats.totalOpens > 0 ? Math.round((stats.appOpens / stats.totalOpens) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.totalOpens > 0 ? (stats.appOpens / stats.totalOpens) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Web Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">🌐 Website</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(stats.webOpens)} 
                ({stats.totalOpens > 0 ? Math.round((stats.webOpens / stats.totalOpens) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.totalOpens > 0 ? (stats.webOpens / stats.totalOpens) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
