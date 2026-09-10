import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../store/appStore';
import { Activity } from 'lucide-react';

export const ConvergenceChart: React.FC = () => {
  const { optimizedResult, isOptimizing, liveHistory, liveEnergy } = useAppStore();

  const history = isOptimizing
    ? liveHistory
    : optimizedResult?.optimization_stats?.history || [];

  const chartData = history.map((val, idx) => ({
    iteration: idx + 1,
    energy: Math.round(val * 100) / 100,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isOptimizing ? 'text-cyan-400 animate-spin' : 'text-cyan-400'}`} />
          <h3 className="font-orbitron font-semibold text-xs text-gray-200 uppercase tracking-wider">
            {isOptimizing ? 'Live Quantum Convergence Stream' : 'Energy Landscape Minimization'}
          </h3>
        </div>
        {liveEnergy !== null && isOptimizing && (
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 animate-pulse">
            Current Energy: {liveEnergy}
          </span>
        )}
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="iteration" stroke="#6b7280" tick={{ fontSize: 10 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1021',
                borderColor: '#00f3ff',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              name="Energy / Cost"
              stroke="#00f3ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!isOptimizing}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
