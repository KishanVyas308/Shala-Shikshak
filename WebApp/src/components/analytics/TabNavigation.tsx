import React from 'react';
import type { TabNavigationProps } from './types';

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'chart' },
    { key: 'content', label: 'Content Analytics', icon: 'content' },
    { key: 'time', label: 'Time Analytics', icon: 'time' },
    { key: 'platform', label: 'Platform Analytics', icon: 'platform' }
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="flex border-b border-gray-100">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === key
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-4 h-4 inline-block mr-2 rounded ${
                activeTab === key ? 'bg-indigo-600' : 'bg-gray-400'
              }`}
            ></div>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
