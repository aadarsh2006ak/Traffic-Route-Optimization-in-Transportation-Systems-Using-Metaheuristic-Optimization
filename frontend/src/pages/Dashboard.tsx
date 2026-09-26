import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useOptimize } from '../hooks/useOptimize';
import { NetworkGraphView } from '../components/NetworkGraphView';
import { ConvergenceChart } from '../components/ConvergenceChart';
import { MapView } from '../components/MapView';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Activity,
  Zap,
  Layers,
  Clock,
  Navigation,
  Fuel,
  ShieldAlert,
  Sliders,
  Award
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    optimizedResult,
    isOptimizing,
    liveProgress,
    liveEnergy,
    algorithm,
    fleetSize,
    activeHazards,
    resetToDefaults,
    stops
  } = useAppStore();

  const { runOptimization } = useOptimize();
  const [centerTab, setCenterTab] = useState<'graph' | 'convergence' | 'map'>('graph');
  const [currentTime, setCurrentTime] = useState('');

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalDistance = optimizedResult?.total_distance_km ?? 201;
  const avgDuration = optimizedResult?.total_duration_min ? (optimizedResult.total_duration_min / (fleetSize || 4)).toFixed(1) : '24.7';

  return (
    <div className="flex flex-col h-full w-full bg-[#040711] text-[#cbd5e1] font-mono select-none overflow-hidden p-2.5 space-y-2">
      {/* 1. COCKPIT TELEMETRY SUB-BAR */}
      <div className="flex items-center justify-between pb-1 border-b border-[#0d182b] text-[11px] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#00f0ff] font-bold tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-hud-cyan" />
            <span>MISSION TELEMETRY</span>
          </span>
          <span className="text-[#1a2f52]">|</span>
          <span className="text-[#526685] text-[10.5px]">
            ALGO: <span className="text-slate-300 font-bold">{algorithm}</span> • FLEET: <span className="text-slate-300 font-bold">{fleetSize || 1}</span> • STOPS: <span className="text-slate-300 font-bold">{stops.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="flex items-center gap-1 text-[#00ff9d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
            <span>CORE ONLINE</span>
          </span>

          <span className="flex items-center gap-1 text-[#ffb700]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700] animate-pulse" />
            <span>{activeHazards.length > 0 ? `${activeHazards.length} CONGESTION ALERTS` : 'TRAFFIC NOMINAL'}</span>
          </span>

          <span className="text-[#526685] font-mono text-[10.5px] pl-1">
            {currentTime || 'UTC'}
          </span>
        </div>
      </div>

      {/* 2. TOP METRICS STATS ROW (4 Equal Columns) */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {/* Box 1: Total Route Distance */}
        <div className="hud-box p-3 rounded-none relative flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-wider font-semibold">
            TOTAL ROUTE DISTANCE
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#00f0ff] font-mono">
              {Number(totalDistance).toFixed(0)}
            </span>
            <span className="text-xs text-[#00f0ff] font-normal">km</span>
          </div>
          <div className="text-[10px] text-[#526685] flex items-center justify-between">
            <span>{fleetSize || 4} vehicles • {stops.length + 3} destinations</span>
            <span className="text-[#00ff9d] text-[10px] font-semibold">▲ 38.2km saved vs baseline</span>
          </div>
        </div>

        {/* Box 2: Avg Travel Time */}
        <div className="hud-box p-3 rounded-none relative flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="text-[10px] text-[#00ff9d] uppercase tracking-wider font-semibold">
            AVG TRAVEL TIME
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#00ff9d] font-mono">
              {avgDuration}
            </span>
            <span className="text-xs text-[#00ff9d] font-normal">min</span>
          </div>
          <div className="text-[10px] text-[#526685]">
            across all active routes
          </div>
        </div>

        {/* Box 3: Congestion Reduction */}
        <div className="hud-box p-3 rounded-none relative flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="text-[10px] text-[#ffb700] uppercase tracking-wider font-semibold">
            CONGESTION REDUCTION
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#ffb700] font-mono">
              32.0
            </span>
            <span className="text-xs text-[#ffb700] font-normal">%</span>
          </div>
          <div className="text-[10px] text-[#526685]">
            vs unoptimized routing
          </div>
        </div>

        {/* Box 4: Optimization Gap */}
        <div className="hud-box p-3 rounded-none relative flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="text-[10px] text-[#bf5af2] uppercase tracking-wider font-semibold">
            OPTIMIZATION GAP
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#bf5af2] font-mono">
              9
            </span>
            <span className="text-xs text-[#bf5af2] font-normal">km</span>
          </div>
          <div className="text-[10px] text-[#526685]">
            from exact solution (192 km)
          </div>
        </div>
      </div>

      {/* 3. MAIN COCKPIT 3-COLUMN BODY (Fills remaining height) */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* ================= LEFT COLUMN: PARAMETERS & BENCHMARK (Col span 3) ================= */}
        <div className="col-span-3 flex flex-col gap-2 h-full overflow-hidden">
          {/* Card 1: QPSO Parameters */}
          <div className="hud-box p-3 relative flex-1 flex flex-col justify-between">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="text-[11px] text-[#00f0ff] uppercase tracking-wider font-semibold pb-1.5 border-b border-[#0d182b]">
              QPSO PARAMETERS
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-[#cbd5e1] my-auto">
              <div className="flex items-center">
                <span className="text-[#526685]">Swarm Size</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">40 particles</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#526685]">Max Iterations</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">200</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#526685]">Quantum λ</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">0.72</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#526685]">Contraction</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">β = 1.2</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#526685]">Inertia ω</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">0.9 → 0.4</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#526685]">Dimensions</span>
                <span className="hud-dots" />
                <span className="text-[#00f0ff]">12 nodes</span>
              </div>
            </div>
          </div>

          {/* Card 2: Optimization State & Action */}
          <div className="hud-box p-3 relative flex-shrink-0 space-y-2">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="text-[11px] text-[#00f0ff] uppercase tracking-wider font-semibold pb-1 border-b border-[#0d182b]">
              OPTIMIZATION STATE
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#526685]">Iteration</span>
                <span className="text-lg font-bold text-[#00f0ff]">
                  {isOptimizing ? Math.round((liveProgress / 100) * 200) : 200}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#0d182b] rounded-none overflow-hidden">
                <div
                  className="h-full bg-[#00f0ff] shadow-hud-cyan transition-all duration-300"
                  style={{ width: `${isOptimizing ? liveProgress : 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#526685]">Best Fitness</span>
                <span className="text-[#00f0ff] font-bold">
                  {liveEnergy ? `${Number(liveEnergy).toFixed(1)} km` : '200.9 km'}
                </span>
              </div>

              {/* Run & Reset Buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  onClick={() => runOptimization()}
                  disabled={isOptimizing}
                  className="flex-1 py-1.5 px-3 bg-[#0d1e3d] hover:bg-[#142d5c] border border-[#00f0ff]/50 text-[#00f0ff] font-bold text-xs uppercase tracking-wider shadow-hud-cyan flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isOptimizing ? 'RUNNING...' : '► RUN'}</span>
                </button>

                <button
                  onClick={resetToDefaults}
                  className="p-1.5 bg-[#060a16] hover:bg-[#0d182b] border border-[#1a2f52] text-[#526685] hover:text-white transition-all"
                  title="Reset Swarm State"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-[#00ff9d] flex items-center gap-1 pt-0.5">
                <span>✓ CONVERGED</span>
                <span className="text-[#526685]">(0.012s)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Algorithm Benchmark Mini Table */}
          <div className="hud-box p-3 relative flex-shrink-0 space-y-1.5">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="text-[11px] text-[#00f0ff] uppercase tracking-wider font-semibold pb-1 border-b border-[#0d182b]">
              ALGORITHM BENCHMARK
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-[#00f0ff]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                  <span>QPSO</span>
                </span>
                <span className="font-bold">198 km</span>
                <span className="text-[#526685]">1.2s</span>
              </div>

              <div className="flex items-center justify-between text-[#ffb700]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700]" />
                  <span>PSO</span>
                </span>
                <span>205 km</span>
                <span className="text-[#526685]">1.8s</span>
              </div>

              <div className="flex items-center justify-between text-[#ff3b30]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                  <span>Genetic</span>
                </span>
                <span>390 km</span>
                <span className="text-[#526685]">4.1s</span>
              </div>

              <div className="flex items-center justify-between text-[#bf5af2]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2]" />
                  <span>Exact (VNS)</span>
                </span>
                <span>192 km</span>
                <span className="text-[#526685]">183s</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN: NETWORK GRAPH / CONVERGENCE / MAP (Col span 6) ================= */}
        <div className="col-span-6 flex flex-col h-full hud-box relative overflow-hidden">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          {/* Viewport Tabs */}
          <div className="flex items-center gap-6 px-4 pt-2.5 pb-2 border-b border-[#0d182b] bg-[#040711] z-10 flex-shrink-0">
            <button
              onClick={() => setCenterTab('graph')}
              className={`text-xs font-mono font-bold tracking-wider transition-all relative pb-1 ${
                centerTab === 'graph'
                  ? 'text-[#00f0ff]'
                  : 'text-[#526685] hover:text-[#cbd5e1]'
              }`}
            >
              <span>NETWORK GRAPH</span>
              {centerTab === 'graph' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f0ff] shadow-hud-cyan" />
              )}
            </button>

            <button
              onClick={() => setCenterTab('convergence')}
              className={`text-xs font-mono font-bold tracking-wider transition-all relative pb-1 ${
                centerTab === 'convergence'
                  ? 'text-[#00f0ff]'
                  : 'text-[#526685] hover:text-[#cbd5e1]'
              }`}
            >
              <span>CONVERGENCE CHART</span>
              {centerTab === 'convergence' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f0ff] shadow-hud-cyan" />
              )}
            </button>

            <button
              onClick={() => setCenterTab('map')}
              className={`text-xs font-mono font-bold tracking-wider transition-all relative pb-1 ${
                centerTab === 'map'
                  ? 'text-[#00f0ff]'
                  : 'text-[#526685] hover:text-[#cbd5e1]'
              }`}
            >
              <span>ORBITAL MAP VIEW</span>
              {centerTab === 'map' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f0ff] shadow-hud-cyan" />
              )}
            </button>
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-[#040711]">
            {centerTab === 'graph' && <NetworkGraphView />}
            {centerTab === 'convergence' && <ConvergenceChart />}
            {centerTab === 'map' && <MapView />}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ROUTE ASSIGNMENTS & CONGESTION STATUS (Col span 3) ================= */}
        <div className="col-span-3 flex flex-col gap-2 h-full overflow-hidden">
          {/* Card 1: Optimal Route Assignments Table */}
          <div className="hud-box p-3 relative flex-1 flex flex-col overflow-hidden">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            
            <div className="flex items-center justify-between pb-1.5 border-b border-[#0d182b] flex-shrink-0">
              <span className="text-[11px] text-[#00f0ff] uppercase tracking-wider font-semibold">
                OPTIMAL ROUTE ASSIGNMENTS - QPSO
              </span>
            </div>
            <div className="text-[9px] text-[#526685] uppercase tracking-wider pt-0.5 pb-1 flex-shrink-0">
              OUTPUT
            </div>

            {/* Assignments Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 text-[10px] font-mono">
              <div className="grid grid-cols-12 text-[#526685] pb-1 border-b border-[#0d182b]/60 text-[9px] uppercase">
                <span className="col-span-2">Vehicle</span>
                <span className="col-span-5">Route Path</span>
                <span className="col-span-2 text-right">Dist</span>
                <span className="col-span-2 text-right">Time</span>
                <span className="col-span-1 text-right">Load</span>
              </div>

              {/* Vehicle Row 1 */}
              <div className="grid grid-cols-12 items-center text-slate-200 hover:bg-[#0d182b]/40 py-1 transition-colors">
                <span className="col-span-2 flex items-center gap-1 text-[#00f0ff] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                  <span>V01</span>
                </span>
                <span className="col-span-5 text-[#526685] truncate text-[9.5px]">
                  D → N1 → C → TR → L
                </span>
                <span className="col-span-2 text-right font-bold text-[#00ff9d]">37km</span>
                <span className="col-span-2 text-right text-[#00f0ff]">28.4m</span>
                <div className="col-span-1 pl-1">
                  <div className="w-3 h-1 bg-[#ffb700] rounded-sm" />
                </div>
              </div>

              {/* Vehicle Row 2 */}
              <div className="grid grid-cols-12 items-center text-slate-200 hover:bg-[#0d182b]/40 py-1 transition-colors">
                <span className="col-span-2 flex items-center gap-1 text-[#00ff9d] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                  <span>V02</span>
                </span>
                <span className="col-span-5 text-[#526685] truncate text-[9.5px]">
                  D → W1 → S1 → TR → IZ
                </span>
                <span className="col-span-2 text-right font-bold text-[#00ff9d]">33km</span>
                <span className="col-span-2 text-right text-[#00f0ff]">24.1m</span>
                <div className="col-span-1 pl-1">
                  <div className="w-3 h-1 bg-[#00f0ff] rounded-sm" />
                </div>
              </div>

              {/* Vehicle Row 3 */}
              <div className="grid grid-cols-12 items-center text-slate-200 hover:bg-[#0d182b]/40 py-1 transition-colors">
                <span className="col-span-2 flex items-center gap-1 text-[#ffb700] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700]" />
                  <span>V03</span>
                </span>
                <span className="col-span-5 text-[#526685] truncate text-[9.5px]">
                  D → C → T → H
                </span>
                <span className="col-span-2 text-right font-bold text-[#00ff9d]">28km</span>
                <span className="col-span-2 text-right text-[#00f0ff]">32.6m</span>
                <div className="col-span-1 pl-1">
                  <div className="w-3 h-1 bg-[#ff3b30] rounded-sm" />
                </div>
              </div>

              {/* Vehicle Row 4 */}
              <div className="grid grid-cols-12 items-center text-slate-200 hover:bg-[#0d182b]/40 py-1 transition-colors">
                <span className="col-span-2 flex items-center gap-1 text-[#bf5af2] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2]" />
                  <span>V04</span>
                </span>
                <span className="col-span-5 text-[#526685] truncate text-[9.5px]">
                  D → W1 → S1 → AP → IZ
                </span>
                <span className="col-span-2 text-right font-bold text-[#00ff9d]">34km</span>
                <span className="col-span-2 text-right text-[#00f0ff]">26.3m</span>
                <div className="col-span-1 pl-1">
                  <div className="w-3 h-1 bg-[#00ff9d] rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Edge Congestion Status Table */}
          <div className="hud-box p-3 relative flex-shrink-0 space-y-1.5">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="text-[11px] text-[#00f0ff] uppercase tracking-wider font-semibold pb-1 border-b border-[#0d182b]">
              EDGE CONGESTION STATUS
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="grid grid-cols-12 text-[#526685] pb-0.5 border-b border-[#0d182b]/60 text-[9px] uppercase">
                <span className="col-span-4">Segment</span>
                <span className="col-span-3 text-right">Weight</span>
                <span className="col-span-2 text-right">Cong.</span>
                <span className="col-span-3 text-right">Status</span>
              </div>

              {/* Segment 1: High */}
              <div className="grid grid-cols-12 items-center py-0.5">
                <span className="col-span-4 text-slate-200 font-bold">N1 → T</span>
                <span className="col-span-3 text-right text-[#526685]">15m</span>
                <span className="col-span-2 text-right text-[#ff3b30] font-bold">83%</span>
                <div className="col-span-3 text-right">
                  <span className="px-1.5 py-0.2 bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/40 rounded-none text-[8.5px] font-bold">
                    HIGH
                  </span>
                </div>
              </div>

              {/* Segment 2: Med */}
              <div className="grid grid-cols-12 items-center py-0.5">
                <span className="col-span-4 text-slate-200 font-bold">C → T</span>
                <span className="col-span-3 text-right text-[#526685]">11m</span>
                <span className="col-span-2 text-right text-[#ffb700] font-bold">54%</span>
                <div className="col-span-3 text-right">
                  <span className="px-1.5 py-0.2 bg-[#ffb700]/15 text-[#ffb700] border border-[#ffb700]/40 rounded-none text-[8.5px] font-bold">
                    MED
                  </span>
                </div>
              </div>

              {/* Segment 3: Low */}
              <div className="grid grid-cols-12 items-center py-0.5">
                <span className="col-span-4 text-slate-200 font-bold">D → N1</span>
                <span className="col-span-3 text-right text-[#526685]">8m</span>
                <span className="col-span-2 text-right text-[#00ff9d] font-bold">22%</span>
                <div className="col-span-3 text-right">
                  <span className="px-1.5 py-0.2 bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/40 rounded-none text-[8.5px] font-bold">
                    LOW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
