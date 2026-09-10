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
import { Award, Zap, Clock, ShieldCheck } from 'lucide-react';

export const BenchmarkChart: React.FC = () => {
  const { benchmarkResults } = useAppStore();

  if (!benchmarkResults) return null;

  const { summary, convergence, runtimes } = benchmarkResults;

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

  const colors = ['#00f3ff', '#ff9100', '#bc13fe', '#00e676', '#ff2b2b', '#eab308'];

  return (
    <div className="space-y-6">
      {/* 1. Summary Table */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <h3 className="font-orbitron font-semibold text-sm text-cyan-400 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" /> Benchmark Results Summary
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] uppercase">
                <th className="p-2.5">Algorithm</th>
                <th className="p-2.5">Distance (km)</th>
                <th className="p-2.5">Duration (min)</th>
                <th className="p-2.5">Runtime (s)</th>
                <th className="p-2.5">Iterations</th>
                <th className="p-2.5">Gap (%)</th>
                <th className="p-2.5">Feasibility</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-800/60 hover:bg-cyan-500/10 transition-colors ${
                    row['Gap from Best (%)'].includes('Best') ? 'bg-cyan-950/20 font-semibold text-cyan-300' : 'text-gray-200'
                  }`}
                >
                  <td className="p-2.5 font-orbitron">{row.Algorithm}</td>
                  <td className="p-2.5">{row['Distance (km)']} km</td>
                  <td className="p-2.5">{row['Duration (min)']} m</td>
                  <td className="p-2.5 font-mono">{row['Runtime (s)']}s</td>
                  <td className="p-2.5 font-mono">{row.Iterations}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        row['Gap from Best (%)'].includes('Best')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {row['Gap from Best (%)']}
                    </span>
                  </td>
                  <td className="p-2.5 text-gray-300">{row.Feasible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Convergence Multi-Line Chart */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <h4 className="font-orbitron text-xs text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Multi-Algorithm Convergence
          </h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="progress" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1021', borderColor: '#00f3ff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {normalizedKeys.map((algo, i) => (
                  <Line
                    key={algo}
                    type="monotone"
                    dataKey={algo}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Runtime Comparison Bar Chart */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <h4 className="font-orbitron text-xs text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-400" /> Runtime Comparison (Seconds)
          </h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runtimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="Algorithm" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1021', borderColor: '#ff9100', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="Runtime (s)" fill="#ff9100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
