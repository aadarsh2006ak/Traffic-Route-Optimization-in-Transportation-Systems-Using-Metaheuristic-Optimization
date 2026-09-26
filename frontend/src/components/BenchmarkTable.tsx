import React from 'react';
import { Download, Award, Clock, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export interface BenchmarkItem {
  algorithm?: string;
  Algorithm?: string;
  total_cost?: number;
  distance_km?: number;
  duration_min?: number;
  'Distance (km)'?: number;
  'Duration (min)'?: number;
  congestion_cost?: number;
  iterations?: number;
  iterations_to_converge?: number;
  'Iterations'?: number;
  runtime_sec?: number;
  'Runtime (s)'?: number;
  stability_std?: number;
  stability_std_dev?: number;
  success_rate?: string;
  success_rate_pct?: number;
  qpso_gap_pct?: string;
}

interface BenchmarkTableProps {
  results: BenchmarkItem[];
  runId?: string;
}

export const BenchmarkTable: React.FC<BenchmarkTableProps> = ({ results, runId }) => {
  if (!results || results.length === 0) return null;

  const handleDownloadCsv = () => {
    if (runId) {
      window.open(api.getBenchmarkCsvUrl(runId), '_blank');
      return;
    }

    const headers = [
      'Algorithm',
      'Total Cost',
      'Distance (km)',
      'Duration (min)',
      'Iterations',
      'Runtime (s)',
      'Stability (σ)',
      'Success Rate',
    ];
    const rows = results.map((r) => [
      r.algorithm || r.Algorithm || '',
      r.total_cost || 0,
      r.distance_km || r['Distance (km)'] || 0,
      r.duration_min || r['Duration (min)'] || 0,
      r.iterations || r.iterations_to_converge || r['Iterations'] || 0,
      r.runtime_sec || r['Runtime (s)'] || 0,
      r.stability_std || r.stability_std_dev || 0,
      r.success_rate || `${r.success_rate_pct || 100}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `benchmark_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const costs = results.map((r) => Number(r.total_cost || 0)).filter((c) => c > 0);
  const bestCost = costs.length > 0 ? Math.min(...costs) : 0;

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-5 space-y-3.5 border border-white/[0.08] text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-sm text-white flex items-center gap-2">
              <span>Benchmark Evaluation Leaderboard</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SIH PS 26137
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Quantitative comparison across QPSO, Classical PSO, GA, ACO, Simulated Annealing & Exact Solvers
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-xs font-syne font-semibold border border-white/[0.08] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.08] text-[10px] font-syne uppercase text-slate-400 bg-white/[0.02]">
              <th className="py-2.5 px-3">Algorithm</th>
              <th className="py-2.5 px-3 text-right">Total Energy/Cost</th>
              <th className="py-2.5 px-3 text-right">Dist (km)</th>
              <th className="py-2.5 px-3 text-right">Time (min)</th>
              <th className="py-2.5 px-3 text-right">Iterations</th>
              <th className="py-2.5 px-3 text-right">Runtime</th>
              <th className="py-2.5 px-3 text-right">Stability (σ)</th>
              <th className="py-2.5 px-3 text-right">Gap vs Best</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {results.map((r, idx) => {
              const name = r.algorithm || r.Algorithm || `Solver ${idx + 1}`;
              const cost = Number(r.total_cost || 0);
              const isWinner = cost > 0 && cost === bestCost;
              const dist = Number(r.distance_km || r['Distance (km)'] || 0);
              const dur = Number(r.duration_min || r['Duration (min)'] || 0);
              const iters = r.iterations || r.iterations_to_converge || r['Iterations'] || '-';
              const runtime = Number(r.runtime_sec || r['Runtime (s)'] || 0);
              const stability = Number(r.stability_std || r.stability_std_dev || 0);
              const gap = r.qpso_gap_pct || (isWinner ? '0.0%' : `+${(((cost - bestCost) / (bestCost || 1)) * 100).toFixed(1)}%`);

              return (
                <tr
                  key={idx}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    isWinner ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    {isWinner && <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    <span className="font-syne font-bold">{name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    ₹{cost.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{dist.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{dur.toFixed(0)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{iters}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{runtime.toFixed(2)}s</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">±{stability.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isWinner ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {gap}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchmarkTable;
