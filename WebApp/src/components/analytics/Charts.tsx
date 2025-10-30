import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatChartData } from '../../services/analytics';
import type { ChartsProps } from './types';

const Charts: React.FC<ChartsProps> = ({ overview, dailyData, selectedPeriod, formatNumber, chartColors }) => {
  if (!overview) return null;

  // Prepare pie chart data
  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const pieData = overview.topPages.slice(0, 6).map((page, index) => ({
    name: page.displayName.length > 20 ? page.displayName.substring(0, 20) + '...' : page.displayName,
    value: page.views,
    fullName: page.displayName,
    color: pieColors[index]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {/* Views Over Time with Area Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Views Trend
          </h3>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
            Last {selectedPeriod} days
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={formatChartData(dailyData)}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="uniqueViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1} />
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Page Distribution
          </h3>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">Top 6 pages</div>
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
                props.payload.fullName,
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
