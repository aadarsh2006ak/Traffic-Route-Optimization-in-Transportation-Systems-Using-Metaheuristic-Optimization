import React, { useState } from 'react';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/Sidebar';
import { RouteOptimizer } from './pages/RouteOptimizer';
import { BenchmarkLab } from './pages/BenchmarkLab';
import { NetworkGraph } from './pages/NetworkGraph';
import { Map, Award, Network, Cpu, SlidersHorizontal } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, algorithm, stops } = useAppStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050711] text-gray-100 font-sans">
      {/* 1. Desktop Sidebar (Visible on screens >= 1024px) */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. Mobile/Tablet Off-Canvas Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-[88vw] max-w-sm sm:max-w-md h-full bg-[#070a18] shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden p-2.5 sm:p-4 md:p-6 space-y-3 sm:space-y-4 relative">
        {/* Top App Header & Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-800/80">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron font-semibold shadow-sm hover:bg-cyan-500/30 transition-all flex-shrink-0"
              title="Open Stops & Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Stops & Config</span>
            </button>

            {/* Navigation Tab Buttons (Scrollable on small mobile) */}
            <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'optimizer'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Optimizer</span>
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'benchmark'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400 shadow-neon-purple'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Benchmark</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'graph'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Graph</span>
              </button>
            </nav>
          </div>

          {/* Top Status HUD Badges (Collapsible / Compact on mobile) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#0a0f1d] border border-cyan-500/30 rounded-full text-[10px] sm:text-xs font-mono text-cyan-400">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[120px]">{algorithm}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-[#0a0f1d] border border-emerald-500/30 rounded-full text-[10px] sm:text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">FastAPI & WS</span> Online
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="flex-1 pb-16 sm:pb-6 min-h-0">
          {activeTab === 'optimizer' && <RouteOptimizer />}
          {activeTab === 'benchmark' && <BenchmarkLab />}
          {activeTab === 'graph' && <NetworkGraph />}
        </div>

        {/* Mobile Floating Action Button to configure stops & params */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-orbitron font-bold text-xs shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Fleet & Stops ({stops.length})</span>
        </button>
      </main>
    </div>
  );
};

export default App;
