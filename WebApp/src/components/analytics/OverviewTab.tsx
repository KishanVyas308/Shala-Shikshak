import React from 'react';
import StatsCards from './StatsCards';
import Charts from './Charts';
import TopPages from './TopPages';
import QuickInsights from './QuickInsights';
import type { AnalyticsProps } from './types';

const OverviewTab: React.FC<AnalyticsProps> = ({
  overview,
  dailyData,
  selectedPeriod,
  formatNumber,
  getGrowthIcon,
  chartColors,
}) => {
  if (!overview) return null;

  return (
    <>
      {/* Enhanced Stats Cards with Platform Breakdown */}
      <StatsCards overview={overview} formatNumber={formatNumber} getGrowthIcon={getGrowthIcon} />

      {/* Enhanced Charts */}
      <Charts
        overview={overview}
        dailyData={dailyData}
        selectedPeriod={selectedPeriod}
        formatNumber={formatNumber}
        chartColors={chartColors}
      />

      {/* Enhanced Top Pages List with Platform Indicators */}
      <TopPages overview={overview} formatNumber={formatNumber} />

      {/* Enhanced Quick Insights with Platform Data */}
      <QuickInsights overview={overview} formatNumber={formatNumber} />
    </>
  );
};

export default OverviewTab;
