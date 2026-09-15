import React from 'react';
import { MapView } from '../components/MapView';
import { MetricsCards } from '../components/MetricsCards';
import { ConvergenceChart } from '../components/ConvergenceChart';
import { useAppStore } from '../store/appStore';
import { useOptimize } from '../hooks/useOptimize';
import { Zap, Play, Sparkles, Navigation, Layers } from 'lucide-react';

export const RouteOptimizer: React.FC = () => {
  const { optimizedResult, isOptimizing, stops, setStops, setStartLocation, algorithm } = useAppStore();
  const { runOptimization } = useOptimize();

  const loadQuickPreset = (count: number) => {
    if (count === 5) {
      setStartLocation({ name: 'Central Logistics Hub, New Delhi', coords: [28.6139, 77.209], demand: 0 });
      setStops([
        { name: 'India Gate, New Delhi', coords: [28.6129, 77.2295], demand: 2, window: [9, 13] },
        { name: 'Red Fort, Delhi', coords: [28.6562, 77.241], demand: 1, window: [10, 14] },
        { name: 'Lotus Temple, New Delhi', coords: [28.5535, 77.2588], demand: 3, window: [11, 15] },
        { name: 'Qutub Minar, New Delhi', coords: [28.5244, 77.1855], demand: 2, window: [12, 16] },
        { name: 'Akshardham Temple, Delhi', coords: [28.6127, 77.2773], demand: 1, window: [9, 13] },
      ]);
    } else if (count === 10) {
      setStartLocation({ name: 'Connaught Place, New Delhi', coords: [28.6315, 77.2167], demand: 0 });
      setStops([
        { name: 'India Gate, New Delhi', coords: [28.6129, 77.2295], demand: 2, window: [9, 12] },
        { name: 'Red Fort, Delhi', coords: [28.6562, 77.241], demand: 1, window: [10, 14] },
        { name: 'Lotus Temple, New Delhi', coords: [28.5535, 77.2588], demand: 3, window: [11, 15] },
        { name: 'Qutub Minar, New Delhi', coords: [28.5244, 77.1855], demand: 2, window: [12, 16] },
        { name: 'Akshardham Temple, Delhi', coords: [28.6127, 77.2773], demand: 1, window: [9, 13] },
        { name: 'Hauz Khas Village, New Delhi', coords: [28.5534, 77.1945], demand: 2, window: [13, 17] },
        { name: 'Cyber Hub, Gurugram', coords: [28.4952, 77.0886], demand: 3, window: [10, 16] },
        { name: 'Noida Sector 18, Noida', coords: [28.5708, 77.3271], demand: 2, window: [11, 17] },
        { name: 'Karol Bagh, New Delhi', coords: [28.6517, 77.1906], demand: 1, window: [9, 14] },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick-Action Bar for One-Click User Testing */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#070a16] via-[#090e24] to-[#070a16]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-orbitron font-bold text-gray-200">
              Quick Dispatch & Evaluation Presets:
            </span>
            <span className="text-[11px] text-gray-400 block font-mono">
              Active: {stops.length} stops configured • Algorithm: {algorithm}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadQuickPreset(5)}
            className="px-2.5 py-1.5 rounded-lg bg-gray-900/80 hover:bg-cyan-950/60 border border-gray-700 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>5 Delhi Hubs</span>
          </button>

          <button
            onClick={() => loadQuickPreset(10)}
            className="px-2.5 py-1.5 rounded-lg bg-gray-900/80 hover:bg-cyan-950/60 border border-gray-700 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3 h-3 text-purple-400" />
            <span>10 City Stops</span>
          </button>

          <button
            onClick={() => runOptimization()}
            disabled={isOptimizing}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-orbitron font-bold text-xs shadow-neon-cyan transition-all flex items-center gap-1.5"
          >
            {isOptimizing ? (
              <span>Solving...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Optimize Route</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <MetricsCards />

      {/* Main Map View with Hazard Overlays & Multi-Vehicle Routes */}
      <MapView />

      {/* Real-time Convergence Chart */}
      {(optimizedResult || isOptimizing) && <ConvergenceChart />}
    </div>
  );
};
