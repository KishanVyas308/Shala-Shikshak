import React from 'react';
import type { AnalyticsOverview } from '../../types';

interface TopPagesProps {
  overview: AnalyticsOverview;
  formatNumber: (num: number) => string;
}

const TopPages: React.FC<TopPagesProps> = ({ overview, formatNumber }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Most Popular Pages
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Web</span>
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">App</span>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
            {overview.topPages.length} total pages
          </div>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {overview.topPages.slice(0, 15).map((page, index) => (
            <div
              key={page.page}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index < 3
                      ? index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : 'bg-orange-500'
                      : 'bg-blue-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{page.displayName}</p>
                  <p className="text-xs text-gray-500">{page.page}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(page.views)}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600">{formatNumber(page.uniqueViews)}</p>
                  <p className="text-xs text-gray-500">Unique</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-600">
                    {((page.uniqueViews / page.views) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Engagement</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!overview.topPages || overview.topPages.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-sm">Page view data will appear here as users visit your platform.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPages;
