import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Database, 
  Clock, 
  Route, 
  Activity, 
  RefreshCw, 
  Cpu, 
  Award, 
  Layers, 
  Zap, 
  FileText,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const RunHistory: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'runs' | 'benchmarks'>('runs');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [runsRes, benchRes] = await Promise.all([
        api.getOptimizationHistory(50),
        api.getBenchmarkHistory(20),
      ]);
      if (runsRes && runsRes.runs) setRuns(runsRes.runs);
      if (benchRes && benchRes.benchmarks) setBenchmarks(benchRes.benchmarks);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredRuns = runs.filter(r => 
    !searchTerm || 
    r.algorithm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.id).includes(searchTerm)
  );

  const totalDistance = runs.reduce((acc, r) => acc + (parseFloat(r.total_distance_km) || 0), 0);
  const avgSolveTime = runs.length ? (runs.reduce((acc, r) => acc + (parseFloat(r.runtime_sec) || 0), 0) / runs.length).toFixed(3) : '0.000';
  const totalTunnels = runs.reduce((acc, r) => acc + (parseInt(r.tunnels) || 0), 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Card */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-indigo-500/10 via-emerald-500/5 to-transparent pointer-events-none rounded-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white tracking-tight">
                  Telemetry & Mission Logs
                </h1>
                <p className="text-xs text-slate-400 font-sans">
                  Persistent SQLite audit records of quantum solver executions and comparative benchmark matrices.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tab switchers */}
            <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setActiveTab('runs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'runs'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Optimization Runs ({runs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('benchmarks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'benchmarks'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Benchmark Suites ({benchmarks.length})</span>
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-medium transition-all"
              title="Refresh Audit Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Logged Dispatches</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">{runs.length} Runs</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Distance Evaluated</span>
            <div className="text-base font-mono font-bold text-indigo-400 mt-0.5">{totalDistance.toFixed(1)} km</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Avg Quantum Convergence</span>
            <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">{avgSolveTime}s</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Quantum Tunneling Events</span>
            <div className="text-base font-mono font-bold text-amber-400 mt-0.5">{totalTunnels} Jumps</div>
          </div>
        </div>
      </div>

      {/* 2. Content Sections */}
      {activeTab === 'runs' && (
        <div className="glass-card p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Execution Audit Ledger</span>
            </h2>

            <input
              type="text"
              placeholder="Filter by algorithm or run ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 w-full sm:w-64"
            />
          </div>

          {filteredRuns.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-slate-500">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">No telemetry logs found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Trigger a route optimization dispatch from the Optimizer workspace to record state vectors into the persistent SQLite log.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/40">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Mission #</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Algorithm Engine</th>
                    <th className="p-3.5 text-right">Waypoints</th>
                    <th className="p-3.5 text-right">Vehicles</th>
                    <th className="p-3.5 text-right">Total Dist (km)</th>
                    <th className="p-3.5 text-right">Duration (min)</th>
                    <th className="p-3.5 text-right">Solve Latency</th>
                    <th className="p-3.5 text-right">Tunnel Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRuns.map((r) => {
                    const isQpso = r.algorithm?.includes('QPSO') || r.algorithm?.includes('Quantum');
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-3.5 text-slate-500 font-mono">#{r.id}</td>
                        <td className="p-3.5 text-slate-300 whitespace-nowrap">{formatDate(r.timestamp)}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium border ${
                            isQpso 
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                              : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
                          }`}>
                            {isQpso ? <Sparkles className="w-3 h-3 text-indigo-400" /> : <Cpu className="w-3 h-3 text-slate-400" />}
                            <span>{r.algorithm}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-slate-200">{r.stop_count}</td>
                        <td className="p-3.5 text-right text-slate-200">{r.fleet_size}</td>
                        <td className="p-3.5 text-right font-bold text-white">{parseFloat(r.total_distance_km || 0).toFixed(2)} km</td>
                        <td className="p-3.5 text-right text-amber-400">{parseFloat(r.duration_min || 0).toFixed(1)} m</td>
                        <td className="p-3.5 text-right text-emerald-400 font-semibold">{parseFloat(r.runtime_sec || 0).toFixed(3)}s</td>
                        <td className="p-3.5 text-right text-indigo-400 font-semibold">{r.tunnels || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          {benchmarks.length === 0 ? (
            <div className="glass-card p-16 text-center text-slate-400 space-y-3 rounded-2xl border border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-slate-500">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">No benchmark suites executed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Launch the Multi-Solver Benchmark evaluation to compare QPSO against Classical PSO, Genetic Algorithms, and ACO across standard scenarios.
              </p>
            </div>
          ) : (
            benchmarks.map((b) => (
              <div key={b.id} className="glass-card p-5 rounded-2xl border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-white">
                        Suite #{b.id}: {b.scenario?.toUpperCase()} ({b.stop_count} Delivery Nodes)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Dataset Source: <span className="text-indigo-300">{b.dataset_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(b.timestamp)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/40">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-white/[0.02] text-slate-400 border-b border-white/[0.06] uppercase text-[10px] tracking-wider">
                        <th className="p-3">Solver Engine</th>
                        <th className="p-3 text-right">Distance (km)</th>
                        <th className="p-3 text-right">Optimality Gap</th>
                        <th className="p-3 text-right">Runtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {Array.isArray(b.results) &&
                        b.results.map((res: any, idx: number) => {
                          const alg = res.Algorithm || res.algorithm || '';
                          const isQpso = alg.includes('QPSO') || alg.includes('Quantum');
                          const isBest = idx === 0 || (res['Gap from Best (%)'] === '0.00%');
                          return (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 flex items-center gap-2">
                                <span className={`font-sans font-medium ${isQpso ? 'text-indigo-300 font-semibold' : 'text-slate-300'}`}>
                                  {alg}
                                </span>
                                {isBest && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                                    ★ Top Rank
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right font-bold text-white">
                                {res['Distance (km)'] || res.distance_km} km
                              </td>
                              <td className="p-3 text-right text-emerald-400 font-semibold">
                                {res['Gap from Best (%)'] || res.optimality_gap || '0.00%'}
                              </td>
                              <td className="p-3 text-right text-slate-400">
                                {res['Runtime (s)'] || res.runtime_sec} s
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
