import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAppStore } from '../store/appStore';
import { Award, Zap, Clock, ShieldCheck, Activity, BarChart3 } from 'lucide-react';

export const BenchmarkChart: React.FC = () => {
  const { benchmarkResults } = useAppStore();

  if (!benchmarkResults) return null;

  const summary = benchmarkResults.summary || benchmarkResults.summary_table || [];
  const convergence = benchmarkResults.convergence || {};
  const runtimes = benchmarkResults.runtimes || {};

  // Prepare convergence multi-line chart data
  const normalizedKeys = Object.keys(convergence || {});
  const sampleLength = normalizedKeys.length > 0 ? convergence[normalizedKeys[0]].length : 0;

  const convergenceData = [];
  for (let i = 0; i < sampleLength; i++) {
    const item: any = { progress: `${Math.round((i / Math.max(1, sampleLength - 1)) * 100)}%` };
    normalizedKeys.forEach((algo) => {
      item[algo] = Math.round((convergence[algo][i] || 0) * 100) / 100;
    });
    convergenceData.push(item);
  }

  // Runtime comparison bar chart data
  const runtimeData = Object.keys(runtimes).map((algo) => ({
    name: algo,
    runtime: Number(runtimes[algo]).toFixed(3),
  }));

  const colors: Record<string, string> = {
    QPSO: '#10b981',
    'Classical PSO': '#f59e0b',
    'Genetic Algorithm': '#a855f7',
    'Ant Colony': '#06b6d4',
    'Simulated Annealing': '#ec4899',
    'Exact Solver': '#6366f1',
  };

  return (
    <div className="space-y-4">
      {/* 2 Charts Grid: Convergence + Compute Runtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Convergence Multi-Line Chart */}
        <div className="glass-surface p-4 sm:p-5 rounded-2xl space-y-2.5 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h4 className="font-syne text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Multi-Solver Cost Convergence
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Lower is better</span>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convergenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="progress"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Syne', paddingTop: '8px' }} />
                {normalizedKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[key] || '#38bdf8'}
                    strokeWidth={key === 'QPSO' ? 2.8 : 1.6}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Solver Execution Runtime Bar Chart */}
        <div className="glass-surface p-4 sm:p-5 rounded-2xl space-y-2.5 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h4 className="font-syne text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Compute Execution Runtime (Seconds)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Computational overhead</span>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runtimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Syne' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Bar dataKey="runtime" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkChart;
