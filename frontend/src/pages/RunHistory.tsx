import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Database, Clock, Route, Activity, RefreshCw, ShieldAlert, Cpu, Award } from 'lucide-react';

export const RunHistory: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'runs' | 'benchmarks'>('runs');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [runsRes, benchRes] = await Promise.all([
        api.getOptimizationHistory(30),
        api.getBenchmarkHistory(10),
      ]);
      if (runsRes && runsRes.runs) setRuns(runsRes.runs);
      if (benchRes && benchRes.benchmarks) setBenchmarks(benchRes.benchmarks);
    } catch {
      // Fallback if empty
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + date.toLocaleDateString() + ')';
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Refresh Control */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-sm text-cyan-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>SQLite Database Run History & Persistence</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Audit logs and metric records automatically saved into persistent storage (<code className="text-cyan-300">route_history.db</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-800">
            <button
              onClick={() => setActiveTab('runs')}
              className={`px-3 py-1 rounded-md text-xs font-orbitron font-semibold transition-all ${
                activeTab === 'runs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Route Runs ({runs.length})
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1 rounded-md text-xs font-orbitron font-semibold transition-all ${
                activeTab === 'benchmarks'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Benchmarks ({benchmarks.length})
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Runs Table */}
      {activeTab === 'runs' && (
        <div className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3">
          {runs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Activity className="w-8 h-8 mx-auto text-gray-600" />
              <p className="text-xs">No optimization runs logged yet. Execute a route run in the Optimizer tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#070a16]">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400">
                    <th className="p-3">Run ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3 text-right">Stops</th>
                    <th className="p-3 text-right">Fleet</th>
                    <th className="p-3 text-right">Distance (km)</th>
                    <th className="p-3 text-right">Duration (min)</th>
                    <th className="p-3 text-right">Solve Time (s)</th>
                    <th className="p-3 text-right">Tunnels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {runs.map((r) => {
                    const isQpso = r.algorithm?.includes('QPSO');
                    return (
                      <tr key={r.id} className="hover:bg-gray-900/40 text-gray-300">
                        <td className="p-3 text-gray-500">#{r.id}</td>
                        <td className="p-3 text-gray-400">{formatDate(r.timestamp)}</td>
                        <td className="p-3 font-semibold text-cyan-300 flex items-center gap-1.5">
                          {isQpso && <Cpu className="w-3 h-3 text-cyan-400" />}
                          <span>{r.algorithm}</span>
                        </td>
                        <td className="p-3 text-right">{r.stop_count}</td>
                        <td className="p-3 text-right">{r.fleet_size}</td>
                        <td className="p-3 text-right font-bold text-gray-100">{r.total_distance_km} km</td>
                        <td className="p-3 text-right text-amber-300">{r.duration_min} m</td>
                        <td className="p-3 text-right text-emerald-400">{r.runtime_sec} s</td>
                        <td className="p-3 text-right text-cyan-400">{r.tunnels || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Benchmark Logs */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          {benchmarks.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-400 space-y-2 rounded-2xl border border-gray-800">
              <Award className="w-8 h-8 mx-auto text-gray-600" />
              <p className="text-xs">No benchmark executions saved yet. Run the benchmark suite to log comparative matrices.</p>
            </div>
          ) : (
            benchmarks.map((b) => (
              <div key={b.id} className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-purple-300">
                      Benchmark #{b.id}: {b.scenario?.toUpperCase()} ({b.stop_count} Stops)
                    </span>
                    <span className="text-gray-500 font-mono">Dataset: {b.dataset_name}</span>
                  </div>
                  <span className="text-gray-400 font-mono">{formatDate(b.timestamp)}</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#070a16]">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
                        <th className="p-2">Algorithm</th>
                        <th className="p-2 text-right">Distance (km)</th>
                        <th className="p-2 text-right">Optimality Gap</th>
                        <th className="p-2 text-right">Solve Time (s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {Array.isArray(b.results) &&
                        b.results.map((res: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-900/30 text-gray-300">
                            <td className="p-2 text-cyan-300 font-semibold">{res.Algorithm || res.algorithm}</td>
                            <td className="p-2 text-right">{res['Distance (km)'] || res.distance_km} km</td>
                            <td className="p-2 text-right text-emerald-400">{res['Gap from Best (%)'] || res.optimality_gap || '0.00%'}</td>
                            <td className="p-2 text-right">{res['Runtime (s)'] || res.runtime_sec} s</td>
                          </tr>
                        ))}
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
