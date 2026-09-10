import React from 'react';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/Sidebar';
import { RouteOptimizer } from './pages/RouteOptimizer';
import { BenchmarkLab } from './pages/BenchmarkLab';
import { NetworkGraph } from './pages/NetworkGraph';
import { Map, Award, Network, Cpu, Activity } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, algorithm, isOptimizing, isBenchmarking } = useAppStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050711] text-gray-100 font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Top App Header & Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-800/80">
          {/* Navigation Tab Buttons */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all ${
                activeTab === 'optimizer'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Map className="w-4 h-4" /> Route Optimizer
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400 shadow-neon-purple'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4" /> Benchmark Lab
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all ${
                activeTab === 'graph'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Network className="w-4 h-4" /> Network Graph
            </button>
          </nav>

          {/* Top Status HUD Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a0f1d] border border-cyan-500/30 rounded-full text-xs font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Core: {algorithm}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a0f1d] border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FastAPI & WS Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="flex-1 pb-6">
          {activeTab === 'optimizer' && <RouteOptimizer />}
          {activeTab === 'benchmark' && <BenchmarkLab />}
          {activeTab === 'graph' && <NetworkGraph />}
        </div>
      </main>
    </div>
  );
};

export default App;
