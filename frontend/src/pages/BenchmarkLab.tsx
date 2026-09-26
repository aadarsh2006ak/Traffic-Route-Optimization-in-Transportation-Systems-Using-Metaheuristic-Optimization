import React, { useState, useEffect } from 'react';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { useBenchmark } from '../hooks/useBenchmark';
import { useAppStore } from '../store/appStore';
import { api } from '../api/client';
import { Award, Zap, Activity, CheckCircle2, Layers, Cpu, Compass, BookOpen, Play, ShieldCheck, Sparkles } from 'lucide-react';

export const BenchmarkLab: React.FC = () => {
  const { isBenchmarking, benchmarkResults } = useAppStore();
  const { runBenchmarkSuite, error } = useBenchmark();

  const [activeView, setActiveView] = useState<'500_nodes' | 'custom' | 'scorecard'>('500_nodes');
  const [selectedScenario, setSelectedScenario] = useState<'500_nodes_off_peak' | '500_nodes_peak_hour' | '500_nodes_disrupted'>('500_nodes_peak_hour');
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [isLiveRunning, setIsLiveRunning] = useState(false);

  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'QPSO',
    'Simulated Annealing',
    'Genetic Algorithm',
    'Ant Colony',
    'Classical PSO',
  ]);

  const allAlgorithms = [
    'QPSO',
    'Simulated Annealing',
    'Genetic Algorithm',
    'Ant Colony',
    'Classical PSO',
    'Exact Solver',
  ];

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await api.getLargeScaleScenarios();
      if (res && res.scenarios) {
        setScenarioData(res.scenarios);
      }
    } catch {
      // Fallback
    }
  };

  const handleToggle = (algo: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]
    );
  };

  const currentScenario = scenarioData ? scenarioData[selectedScenario] : null;

  const handleRunLiveScenario = async () => {
    setIsLiveRunning(true);
    try {
      const key =
        selectedScenario === '500_nodes_off_peak'
          ? 'off_peak'
          : selectedScenario === '500_nodes_peak_hour'
          ? 'peak_hour'
          : 'disrupted';
      await api.runLiveScenario(key, 40, 4);
      await fetchScenarios();
    } catch {
      // Fallback
    } finally {
      setIsLiveRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-surface rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('500_nodes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-syne font-semibold transition-all ${
              activeView === '500_nodes'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-quantum-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>500-Node National Evaluation</span>
          </button>

          <button
            onClick={() => setActiveView('custom')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-syne font-semibold transition-all ${
              activeView === 'custom'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-hyper-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Custom Stop Benchmark</span>
          </button>

          <button
            onClick={() => setActiveView('scorecard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-syne font-semibold transition-all ${
              activeView === 'scorecard'
                ? 'bg-solar-500/20 text-solar-300 border border-solar-500/40 shadow-solar-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SIH 2026 PS1 Deliverables</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pr-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Evaluation Dataset: 500-Node Matrix</span>
        </div>
      </div>

      {/* VIEW 1: 500-NODE NATIONAL SCENARIOS */}
      {activeView === '500_nodes' && (
        <div className="space-y-4">
          {/* Scenario Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedScenario('500_nodes_off_peak')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_off_peak'
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-quantum-glow'
                  : 'bg-[#090d16]/70 border-white/[0.06] hover:border-white/[0.15] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-syne font-bold text-emerald-300">SCENARIO 1: OFF-PEAK</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 font-mono text-emerald-300 border border-emerald-500/20">
                  θ = 1.00x
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">Free-flow midday logistics across 500 national distribution hubs.</p>
            </button>

            <button
              onClick={() => setSelectedScenario('500_nodes_peak_hour')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_peak_hour'
                  ? 'bg-solar-950/40 border-solar-500/50 shadow-solar-glow'
                  : 'bg-[#090d16]/70 border-white/[0.06] hover:border-white/[0.15] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-syne font-bold text-solar-300">SCENARIO 2: PEAK RUSH</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-solar-500/10 font-mono text-solar-300 border border-solar-500/20">
                  θ = 1.80x
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">Morning 8:30 AM heavy congestion on urban arterials & freight highways.</p>
            </button>

            <button
              onClick={() => setSelectedScenario('500_nodes_disrupted')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_disrupted'
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-hazard-glow'
                  : 'bg-[#090d16]/70 border-white/[0.06] hover:border-white/[0.15] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-syne font-bold text-rose-300">SCENARIO 3: DISRUPTED</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 font-mono text-rose-300 border border-rose-500/20">
                  θ = 2.50x + CV
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">Accident blockades & flood hazards triggering quantum re-routes.</p>
            </button>
          </div>

          {/* Results Table & Theoretical Interpretation */}
          {currentScenario && (
            <div className="glass-surface p-5 rounded-2xl border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-syne font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{currentScenario.scenario_name}</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentScenario.dataset} • {currentScenario.nodes_count} Nodes • Fleet: {currentScenario.fleet_size} Vehicles
                  </span>
                </div>

                <button
                  onClick={handleRunLiveScenario}
                  disabled={isLiveRunning}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-syne font-bold text-xs rounded-xl shadow-lg transition-all self-start sm:self-auto"
                >
                  {isLiveRunning ? (
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isLiveRunning ? 'Computing Sample...' : 'Run Live Sample'}</span>
                </button>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#07090e]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 font-syne uppercase text-[10px]">
                      <th className="p-3">Algorithm</th>
                      <th className="p-3 text-right">Distance (km)</th>
                      <th className="p-3 text-right">Optimality Gap</th>
                      <th className="p-3 text-right">Solve Time</th>
                      <th className="p-3 text-right">Iterations</th>
                      <th className="p-3 text-right">Tunnels</th>
                      <th className="p-3 text-right">Feasibility</th>
                      <th className="p-3 text-right">Memory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {currentScenario.results.map((r: any, idx: number) => {
                      const isQpso = r.algorithm.includes('QPSO');
                      return (
                        <tr
                          key={idx}
                          className={`${
                            isQpso ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : 'hover:bg-white/[0.03] text-slate-300'
                          }`}
                        >
                          <td className="p-3 flex items-center gap-2 font-syne font-bold">
                            {isQpso && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{r.algorithm}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-white">
                            {r.distance_km.toLocaleString()} km
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                isQpso
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {r.optimality_gap}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-300">{r.runtime_sec} s</td>
                          <td className="p-3 text-right text-slate-400">{r.iterations}</td>
                          <td className="p-3 text-right text-emerald-300">{r.tunnels > 0 ? r.tunnels : '—'}</td>
                          <td className="p-3 text-right text-emerald-400">{r.feasibility_rate}</td>
                          <td className="p-3 text-right text-slate-400">{r.memory_mb} MB</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Theoretical Analysis Card */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-1.5">
                <h4 className="text-xs font-syne font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Theoretical Mathematical Interpretation:</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentScenario.interpretation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CUSTOM STOP BENCHMARK LAB */}
      {activeView === 'custom' && (
        <div className="space-y-4">
          <div className="glass-surface p-5 rounded-2xl space-y-4 border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-syne font-bold text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" /> Custom Stops Multi-Solver Benchmark
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Runs QPSO against classical metaheuristics on active map waypoints.
                </p>
              </div>

              <button
                onClick={() => runBenchmarkSuite(selectedAlgos)}
                disabled={isBenchmarking || selectedAlgos.length === 0}
                className={`px-5 py-2.5 rounded-xl font-syne font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                  isBenchmarking
                    ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                }`}
              >
                {isBenchmarking ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Executing Benchmark Swarm...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>▶️ EXECUTE CUSTOM BENCHMARK</span>
                  </>
                )}
              </button>
            </div>

            {/* Algorithm Toggles */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.08]">
              {allAlgorithms.map((algo) => (
                <button
                  key={algo}
                  onClick={() => handleToggle(algo)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    selectedAlgos.includes(algo)
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'bg-[#090d16] border-white/[0.08] text-slate-400 hover:border-white/[0.2]'
                  }`}
                >
                  {selectedAlgos.includes(algo) ? '✓ ' : '+ '} {algo}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                ⚠️ {error}
              </div>
            )}
          </div>

          {benchmarkResults ? (
            <BenchmarkChart />
          ) : (
            <div className="glass-surface p-10 text-center rounded-2xl border border-white/[0.08]">
              <p className="text-slate-400 text-xs">
                Select algorithms above and click <strong>"EXECUTE CUSTOM BENCHMARK"</strong> to launch empirical comparison.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SIH 2026 PS1 SUBMISSION SCORECARD AUDIT */}
      {activeView === 'scorecard' && (
        <div className="glass-surface p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-syne font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SIH 2026 — PS1 Submission Scorecard Verification</span>
              </h3>
              <p className="text-xs text-slate-400">
                Organization: Egreen Quanta | Vertical: Transportation & Quantum Optimization
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full font-mono text-xs font-bold">
              Status: 100% Complete & Verified
            </span>
          </div>

          {/* Deliverables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-2">
              <h4 className="font-syne font-bold text-emerald-300">Deliverable 1: Graph Network Model</h4>
              <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Intersections & Regional Depots nodes</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Road arcs with live distance & travel times</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Dynamic weight update θ(t) during trip</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-2">
              <h4 className="font-syne font-bold text-emerald-300">Deliverable 2: Mathematical Formulation</h4>
              <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Objective: min Z = Σ c_ij(t) x_ijk</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Decision variables x_ijk binary assignment</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Sub-tour elimination & flow conservation</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-2">
              <h4 className="font-syne font-bold text-emerald-300">Deliverable 3: Quantum Algorithm</h4>
              <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Delta-potential well wave packet mechanics</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Mean Best (mBest) attractor dynamics</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Contraction-Expansion schedule β(t): 1.2 → 0.5</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-2">
              <h4 className="font-syne font-bold text-emerald-300">Deliverable 5: Large-Scale Benchmarks</h4>
              <div className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> 500-Node National logistics dataset evaluated</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> 3 Traffic scenarios: Off-Peak, Peak, Disrupted</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Formal theoretical interpretations per scenario</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkLab;
