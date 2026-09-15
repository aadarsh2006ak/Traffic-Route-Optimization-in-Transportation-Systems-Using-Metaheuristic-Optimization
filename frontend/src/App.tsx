import React, { useState } from 'react';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/Sidebar';
import { RouteOptimizer } from './pages/RouteOptimizer';
import { BenchmarkLab } from './pages/BenchmarkLab';
import { NetworkGraph } from './pages/NetworkGraph';
import { VisionRadar } from './pages/VisionRadar';
import { RunHistory } from './pages/RunHistory';
import { GuideModal } from './components/GuideModal';
import {
  Map,
  Award,
  Network,
  Cpu,
  SlidersHorizontal,
  Radio,
  ShieldAlert,
  Zap,
  Database,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useOptimize } from './hooks/useOptimize';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, algorithm, stops, activeHazards, hazardsEnabled } = useAppStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { runOptimization } = useOptimize();

  const hasBlockedHazard = activeHazards.some((h) => h.is_blocked || h.severity >= 0.85);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050711] text-gray-100 font-sans">
      {/* 1. Desktop Sidebar */}
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

            {/* Navigation Tab Buttons */}
            <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'optimizer'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Optimizer</span>
              </button>

              <button
                onClick={() => setActiveTab('vision')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap relative ${
                  activeTab === 'vision'
                    ? 'bg-red-500/20 text-red-300 border border-red-400 shadow-neon-red'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeHazards.length > 0 ? 'text-red-400 animate-pulse' : ''}`} />
                <span>Vision Radar</span>
                {activeHazards.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-mono font-bold">
                    {activeHazards.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'benchmark'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400 shadow-neon-purple'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>500-Node Benchmarks</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'graph'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Graph & Traffic θ(t)</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-orbitron font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Run History</span>
              </button>
            </nav>
          </div>

          {/* Top Status HUD & User Guide Modal Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 hover:from-purple-800/60 hover:to-cyan-800/60 border border-cyan-400/40 rounded-full text-[11px] font-orbitron text-cyan-200 shadow-md transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
              <span>Guide & Docs</span>
            </button>

            {hazardsEnabled && activeHazards.length > 0 && (
              <div
                onClick={() => setActiveTab('vision')}
                className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-red-950/60 border border-red-500/40 rounded-full text-[10px] sm:text-xs font-mono text-red-300 animate-pulse hover:bg-red-900/60 transition-colors"
                title="Click to open Vision Radar"
              >
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>{activeHazards.length} Incidents</span>
              </div>
            )}

            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#0a0f1d] border border-cyan-500/30 rounded-full text-[10px] sm:text-xs font-mono text-cyan-400">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[120px]">{algorithm}</span>
            </div>
          </div>
        </header>

        {/* Global Critical Incident Warning Banner */}
        {hasBlockedHazard && activeTab !== 'vision' && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-[#0a0f1d] border border-red-500/50 shadow-lg text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce flex-shrink-0" />
              <div>
                <span className="font-bold text-red-300 font-orbitron">
                  CRITICAL ROAD BLOCKAGE DETECTED:
                </span>{' '}
                <span className="text-gray-300">
                  CCTV vision model detected severe blockage on transport corridor.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('vision')}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-orbitron text-[11px] border border-gray-700 transition-all"
              >
                Inspect
              </button>
              <button
                onClick={() => runOptimization()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-orbitron text-[11px] font-bold shadow-lg transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Re-Route Fleet</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        <div className="flex-1 pb-16 sm:pb-6 min-h-0">
          {activeTab === 'optimizer' && <RouteOptimizer />}
          {activeTab === 'vision' && <VisionRadar />}
          {activeTab === 'benchmark' && <BenchmarkLab />}
          {activeTab === 'graph' && <NetworkGraph />}
          {activeTab === 'history' && <RunHistory />}
        </div>

        {/* Mobile Floating Action Button to configure stops & params */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-orbitron font-bold text-xs shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Fleet & Stops ({stops.length})</span>
        </button>

        {/* Interactive Guide & Documentation Modal */}
        <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </main>
    </div>
  );
};

export default App;
