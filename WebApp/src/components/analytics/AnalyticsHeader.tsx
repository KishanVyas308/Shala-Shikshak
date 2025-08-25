import React from 'react';

interface AnalyticsHeaderProps {
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
  handleRefresh: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  handleRefresh,
}) => {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 text-base sm:text-lg">
            Comprehensive insights into your educational platform
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedPeriod === days
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
