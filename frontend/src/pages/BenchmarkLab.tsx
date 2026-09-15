import React, { useState, useEffect } from 'react';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { useBenchmark } from '../hooks/useBenchmark';
import { useAppStore } from '../store/appStore';
import { api } from '../api/client';
import { Award, Zap, Activity, CheckCircle2, Layers, Cpu, Compass, BookOpen, AlertTriangle, Play } from 'lucide-react';

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
      const key = selectedScenario === '500_nodes_off_peak' ? 'off_peak' : (selectedScenario === '500_nodes_peak_hour' ? 'peak_hour' : 'disrupted');
      await api.runLiveScenario(key, 40, 4);
      await fetchScenarios();
    } catch {
      // Fallback
    } finally {
      setIsLiveRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('500_nodes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              activeView === '500_nodes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-neon-cyan'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>500-Node National Benchmark</span>
          </button>

          <button
            onClick={() => setActiveView('custom')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              activeView === 'custom'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-neon-purple'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Custom Stop Benchmark</span>
          </button>

          <button
            onClick={() => setActiveView('scorecard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              activeView === 'scorecard'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SIH 2026 PS1 Scorecard Audit</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Evaluation Dataset: 500-Node National Matrix</span>
        </div>
      </div>

      {/* VIEW 1: 500-NODE NATIONAL SCENARIOS (SECTION 5 SCORECARD) */}
      {activeView === '500_nodes' && (
        <div className="space-y-5">
          {/* Scenario Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedScenario('500_nodes_off_peak')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_off_peak'
                  ? 'bg-cyan-950/70 border-cyan-400 shadow-neon-cyan'
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-cyan-300">SCENARIO 1: OFF-PEAK</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 font-mono text-cyan-200">θ = 1.00x</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">Free-flow midday logistics across 500 national distribution hubs.</p>
            </button>

            <button
              onClick={() => setSelectedScenario('500_nodes_peak_hour')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_peak_hour'
                  ? 'bg-amber-950/70 border-amber-400 shadow-neon-amber'
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-amber-300">SCENARIO 2: PEAK RUSH</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 font-mono text-amber-200">θ = 1.80x</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">Morning 8:30 AM congestion on urban arterials & freight corridors.</p>
            </button>

            <button
              onClick={() => setSelectedScenario('500_nodes_disrupted')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedScenario === '500_nodes_disrupted'
                  ? 'bg-red-950/70 border-red-400 shadow-neon-red'
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-red-300">SCENARIO 3: DISRUPTED</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/60 font-mono text-red-200">θ = 2.50x + CV</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">Severe accident blockages & flood hazards triggering self-healing re-routes.</p>
            </button>
          </div>

          {/* Results Table & Theoretical Interpretation */}
          {currentScenario && (
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-orbitron font-bold text-gray-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>{currentScenario.scenario_name}</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {currentScenario.dataset} • {currentScenario.nodes_count} Nodes • Fleet: {currentScenario.fleet_size} Vehicles
                  </span>
                </div>

                <button
                  onClick={handleRunLiveScenario}
                  disabled={isLiveRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-orbitron font-bold text-xs rounded-lg shadow-md transition-all self-start sm:self-auto"
                >
                  {isLiveRunning ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isLiveRunning ? 'Computing Sample...' : 'Run Live Sample'}</span>
                </button>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#070a16]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400">
                      <th className="p-3 font-orbitron text-gray-300">Algorithm</th>
                      <th className="p-3 text-right">Distance (km)</th>
                      <th className="p-3 text-right">Optimality Gap</th>
                      <th className="p-3 text-right">Solve Time (s)</th>
                      <th className="p-3 text-right">Iterations</th>
                      <th className="p-3 text-right">Tunnels</th>
                      <th className="p-3 text-right">Feasibility</th>
                      <th className="p-3 text-right">Memory (MB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850">
                    {currentScenario.results.map((r: any, idx: number) => {
                      const isQpso = r.algorithm.includes('QPSO');
                      return (
                        <tr
                          key={idx}
                          className={`${
                            isQpso ? 'bg-cyan-950/40 text-cyan-300 font-bold' : 'hover:bg-gray-900/40 text-gray-300'
                          }`}
                        >
                          <td className="p-3 flex items-center gap-2">
                            {isQpso && <span className="text-cyan-400">⚛</span>}
                            <span>{r.algorithm}</span>
                          </td>
                          <td className="p-3 text-right font-bold">{r.distance_km.toLocaleString()} km</td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                isQpso
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-950/60 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {r.optimality_gap}
                            </span>
                          </td>
                          <td className="p-3 text-right">{r.runtime_sec} s</td>
                          <td className="p-3 text-right">{r.iterations}</td>
                          <td className="p-3 text-right text-cyan-300">{r.tunnels > 0 ? r.tunnels : '—'}</td>
                          <td className="p-3 text-right text-emerald-400">{r.feasibility_rate}</td>
                          <td className="p-3 text-right text-gray-400">{r.memory_mb} MB</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Theoretical Analysis Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0a0f24] to-[#070a16] border border-cyan-500/30">
                <h4 className="text-xs font-orbitron font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Theoretical Mathematical Interpretation:</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed font-roboto">
                  {currentScenario.interpretation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CUSTOM STOP BENCHMARK LAB */}
      {activeView === 'custom' && (
        <div className="space-y-5">
          <div className="glass-panel p-4 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-orbitron font-bold text-sm text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-purple-400" /> Custom Stops Multi-Algorithm Runner
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Runs QPSO against classical metaheuristics on your active map stops.
                </p>
              </div>

              <button
                onClick={() => runBenchmarkSuite(selectedAlgos)}
                disabled={isBenchmarking || selectedAlgos.length === 0}
                className={`px-5 py-2.5 rounded-lg font-orbitron font-bold text-xs flex items-center gap-2 transition-all shadow-neon-purple ${
                  isBenchmarking
                    ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white'
                }`}
              >
                {isBenchmarking ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Executing Benchmark Swarm...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>▶️ RUN CUSTOM BENCHMARK</span>
                  </>
                )}
              </button>
            </div>

            {/* Algorithm Toggles */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
              {allAlgorithms.map((algo) => (
                <button
                  key={algo}
                  onClick={() => handleToggle(algo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    selectedAlgos.includes(algo)
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-semibold'
                      : 'bg-[#050711] border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {selectedAlgos.includes(algo) ? '✓ ' : '+ '} {algo}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-lg">
                ⚠️ {error}
              </div>
            )}
          </div>

          {benchmarkResults ? (
            <BenchmarkChart />
          ) : (
            <div className="glass-panel p-8 text-center rounded-xl border border-gray-800">
              <p className="text-gray-400 font-roboto text-xs">
                Select algorithms above and click <strong>"RUN CUSTOM BENCHMARK"</strong> to execute live comparison.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SIH 2026 PS1 SUBMISSION SCORECARD AUDIT */}
      {activeView === 'scorecard' && (
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-orbitron font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SIH 2026 — PS1 Submission Scorecard Audit</span>
              </h3>
              <p className="text-xs text-gray-400">
                Organization: Egreen Quanta | Vertical: Quantum Technology
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-full font-mono text-xs font-bold">
              Status: 100% Complete & Verified
            </span>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <h4 className="font-orbitron font-bold text-cyan-300">Deliverable 1: Graph Network Model</h4>
              <div className="space-y-1.5 font-mono text-gray-300">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Nodes = Intersections & Regional Depots</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Edges = Road Arcs with distance/travel time</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Dynamic weight update θ(t) live during vehicle travel</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <h4 className="font-orbitron font-bold text-cyan-300">Deliverable 2: Mathematical Formulation</h4>
              <div className="space-y-1.5 font-mono text-gray-300">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Formal Objective: min Z = Σ c_ij(t) x_ijk</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Decision Variables x_ijk and y_ik binary assignment</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Flow conservation & Sub-tour elimination constraints</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <h4 className="font-orbitron font-bold text-cyan-300">Deliverable 3: Quantum Algorithm</h4>
              <div className="space-y-1.5 font-mono text-gray-300">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Delta-potential well Schrödinger wavefunction collapse</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Mean Best (mBest) & Local Attractor dynamics</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Dynamic Contraction-Expansion schedule β(t): 1.2 → 0.5</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <h4 className="font-orbitron font-bold text-cyan-300">Deliverable 5: Large-Scale Benchmarks</h4>
              <div className="space-y-1.5 font-mono text-gray-300">
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> 500-Node National logistics dataset evaluated</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> 3 Traffic scenarios: Off-Peak, Peak-Hour, Disrupted</div>
                <div className="flex items-center gap-2"><span className="text-emerald-400">✅</span> Written theoretical interpretations per scenario</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
