import React from 'react';
import type { StatsCardsProps } from './types';

const StatsCards: React.FC<StatsCardsProps> = ({ overview, formatNumber, getGrowthIcon }) => {
  if (!overview) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-8">
      {/* Total Views Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Views</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatNumber(overview.totalViews)}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-blue-50 p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Web: {formatNumber(overview.platformAnalytics.webViews)}</span>
              <span>App: {formatNumber(overview.platformAnalytics.appViews)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
              <span>{getGrowthIcon(overview.growth.viewsGrowth)}</span>
              <span>{Math.abs(overview.growth.viewsGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Unique Visitors Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unique Visitors</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatNumber(overview.uniqueViews)}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-emerald-50 p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Web: {formatNumber(overview.platformAnalytics.webUniqueViews)}</span>
              <span>App: {formatNumber(overview.platformAnalytics.appUniqueViews)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
              <span>{getGrowthIcon(overview.growth.uniqueViewsGrowth)}</span>
              <span>{Math.abs(overview.growth.uniqueViewsGrowth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Recent Views Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Recent Views (24h)</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatNumber(overview.recentViews)}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-purple-50 p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Last 24 hours activity</div>
            <div className="text-xs text-purple-600 font-medium">Across all platforms</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Content Items Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Content Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {overview.contentAnalytics.standardsData.length +
                  overview.contentAnalytics.subjectsData.length +
                  overview.contentAnalytics.chaptersData.length}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-orange-50 p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Standards: {overview.contentAnalytics.standardsData.length}</span>
              <span>Subjects: {overview.contentAnalytics.subjectsData.length}</span>
            </div>
            <div className="text-xs text-orange-600 font-medium">
              Chapters: {overview.contentAnalytics.chaptersData.length}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
