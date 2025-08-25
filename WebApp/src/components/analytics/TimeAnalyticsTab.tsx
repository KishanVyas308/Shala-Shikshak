import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { TimeAnalyticsProps } from './types';

const TimeAnalyticsTab: React.FC<TimeAnalyticsProps> = ({ overview, formatNumber, chartColors }) => {
  if (!overview?.timeAnalytics) return null;

  return (
    <div className="space-y-6">
      {/* Peak Hours */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Peak Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview.timeAnalytics.peakHours.map((peak, index) => (
            <div key={peak.hour} className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-semibold text-indigo-900">
                    {peak.hour}:00 - {peak.hour + 1}:00
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-800">{formatNumber(peak.views)} views</p>
              <p className="text-sm text-indigo-600">
                {((peak.views / overview.totalViews) * 100).toFixed(1)}% of daily traffic
              </p>
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
            <XAxis dataKey="label" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, _name) => [formatNumber(value as number), 'Views']}
              labelFormatter={(label) => `Hour: ${label}`}
            />
            <Bar dataKey="views" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeAnalyticsTab;
