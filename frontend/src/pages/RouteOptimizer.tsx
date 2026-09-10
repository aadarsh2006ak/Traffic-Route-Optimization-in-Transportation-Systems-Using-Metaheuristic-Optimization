import React from 'react';
import { MapView } from '../components/MapView';
import { MetricsCards } from '../components/MetricsCards';
import { ConvergenceChart } from '../components/ConvergenceChart';
import { useAppStore } from '../store/appStore';

export const RouteOptimizer: React.FC = () => {
  const { optimizedResult, isOptimizing } = useAppStore();

  return (
    <div className="space-y-4">
      {/* KPI Metrics */}
      <MetricsCards />

      {/* Main Map View */}
      <MapView />

      {/* Real-time Convergence Chart */}
      {(optimizedResult || isOptimizing) && <ConvergenceChart />}
    </div>
  );
};
