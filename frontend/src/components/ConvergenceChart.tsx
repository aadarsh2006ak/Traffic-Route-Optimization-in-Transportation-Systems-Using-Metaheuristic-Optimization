import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { useAppStore } from '../store/appStore';
import { Activity, Zap, TrendingDown, Clock, Cpu, Sparkles } from 'lucide-react';

interface ConvergenceChartProps {
  multiAlgorithmConvergence?: Array<{
    iteration: number;
    [algo: string]: number;
  }>;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({
  multiAlgorithmConvergence,
}) => {
  const { optimizedResult, isOptimizing, liveHistory, liveEnergy } = useAppStore();

  const isMulti = Boolean(multiAlgorithmConvergence && multiAlgorithmConvergence.length > 0);

  // Single-run data array
  const singleRunHistory = isOptimizing
    ? liveHistory
    : optimizedResult?.stats?.history || optimizedResult?.optimization_stats?.history || [];

  const tunnels = optimizedResult?.stats?.tunnels || 0;
  const runtime = optimizedResult?.runtime_sec || optimizedResult?.stats?.runtime || 0;
  const bestEnergy = isOptimizing
    ? liveEnergy
    : optimizedResult?.stats?.best_energy || optimizedResult?.total_cost || 0;

  const chartData = isMulti
    ? multiAlgorithmConvergence
    : singleRunHistory.map((val: number, idx: number) => ({
        iteration: idx + 1,
        QPSO: Math.round(val * 10) / 10,
      }));

  // Palette for multi-algorithm curves
  const algoColors: Record<string, string> = {
    QPSO: '#3b82f6', // Cobalt
    'Classical PSO': '#f59e0b', // Amber
    'Genetic Algorithm': '#a855f7', // Purple
    'Ant Colony': '#10b981', // Mint
    'Simulated Annealing': '#fb7185', // Rose
    'Exact Solver': '#60a5fa', // Light Cobalt
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3.5 border border-white/[0.08]">
      {/* Header & Metric Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cobalt-500/10 text-cobalt-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>{isMulti ? 'Multi-Solver Energy Convergence Matrix' : 'Quantum Swarm Energy Decay Trace'}</span>
              {isOptimizing && (
                <span className="w-2 h-2 rounded-full bg-cobalt-400 animate-ping" />
              )}
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              {isMulti
                ? 'Empirical iteration-by-iteration cost decay comparison'
                : 'Schrödinger wave packet contraction & particle tunneling events'}
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Pills */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          {!isMulti && bestEnergy !== null && (
            <div className="px-2.5 py-1 rounded-lg bg-carbon-900 border border-white/[0.08] flex items-center gap-1 text-mint-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Score: {Number(bestEnergy).toFixed(1)}</span>
            </div>
          )}

          {!isMulti && tunnels > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-carbon-900 border border-white/[0.08] flex items-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{tunnels} Jumps</span>
            </div>
          )}

          {runtime > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-carbon-900 border border-white/[0.08] flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cobalt-400" />
              <span>{Number(runtime).toFixed(2)}s runtime</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="qpsoGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="iteration"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b101c',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                  color: '#f8fafc',
                }}
              />
              {isMulti && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Outfit', paddingTop: '8px' }} />}

              {isMulti ? (
                Object.keys(algoColors).map((algoName) => (
                  <Line
                    key={algoName}
                    type="monotone"
                    dataKey={algoName}
                    stroke={algoColors[algoName] || '#38bdf8'}
                    strokeWidth={algoName === 'QPSO' ? 3 : 1.8}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey="QPSO"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#qpsoGlow)"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs space-y-2">
            <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
            <p>Awaiting optimization run to generate particle swarm convergence trace.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConvergenceChart;
