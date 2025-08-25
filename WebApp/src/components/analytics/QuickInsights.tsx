import React from 'react';
import type { AnalyticsOverview } from '../../types';

interface QuickInsightsProps {
  overview: AnalyticsOverview;
  formatNumber: (num: number) => string;
}

const QuickInsights: React.FC<QuickInsightsProps> = ({ overview, formatNumber }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights & Platform Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Growth Trend</h4>
          </div>
          <p className="text-sm text-gray-600">
            {overview.growth.viewsGrowth > 0
              ? `Growing! Up ${overview.growth.viewsGrowth.toFixed(1)}%`
              : overview.growth.viewsGrowth < 0
              ? `Down ${Math.abs(overview.growth.viewsGrowth).toFixed(1)}%`
              : 'Stable traffic'}
          </p>
          <p className="text-lg font-bold text-green-600 mt-2">
            {overview.growth.viewsGrowth > 0 ? '↗' : overview.growth.viewsGrowth < 0 ? '↘' : '→'}
            {Math.abs(overview.growth.viewsGrowth).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Web Platform</h4>
          </div>
          <p className="text-sm text-gray-600">
            {overview.platformAnalytics.webViews > 0
              ? `${((overview.platformAnalytics.webViews / overview.totalViews) * 100).toFixed(1)}% of total traffic`
              : 'No web traffic yet'}
          </p>
          <p className="text-lg font-bold text-purple-600 mt-2">
            {formatNumber(overview.platformAnalytics.webViews)} views
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Mobile App</h4>
          </div>
          <p className="text-sm text-gray-600">
            {overview.platformAnalytics.appViews > 0
              ? `${((overview.platformAnalytics.appViews / overview.totalViews) * 100).toFixed(1)}% of total traffic`
              : 'No app traffic yet'}
          </p>
          <p className="text-lg font-bold text-orange-600 mt-2">
            {formatNumber(overview.platformAnalytics.appViews)} views
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickInsights;
