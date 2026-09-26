import React, { useState } from 'react';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ResultsPage } from './pages/ResultsPage';
import { BenchmarkLab } from './pages/BenchmarkLab';
import { NetworkGraph } from './pages/NetworkGraph';
import { VisionRadar } from './pages/VisionRadar';
import { RunHistory } from './pages/RunHistory';
import { GuideModal } from './components/GuideModal';
import {
  Compass,
  BarChart3,
  Award,
  Network,
  Radio,
  Database,
  HelpCircle,
  SlidersHorizontal,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Menu,
  X,
  Maximize2
} from 'lucide-react';
import { useOptimize } from './hooks/useOptimize';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    startLocation,
    stops,
    activeHazards,
    isOptimizing
  } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { runOptimization } = useOptimize();

  const hasBlockedHazard = activeHazards.some((h) => h.is_blocked || h.severity >= 0.85);

  const navTabs = [
    { id: 'optimizer', label: 'COCKPIT', icon: Compass },
    { id: 'results', label: 'DISPATCH', icon: BarChart3 },
    { id: 'benchmark', label: 'BENCHMARK', icon: Award },
    { id: 'graph', label: 'NETWORK θ(t)', icon: Network },
    { id: 'vision', label: 'VISION RADAR', icon: Radio, badge: activeHazards.length > 0 ? `${activeHazards.length}` : null },
    { id: 'history', label: 'LOGS', icon: Database },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#03060f] text-[#cbd5e1] font-mono select-none relative">
      {/* 1. Off-Canvas Sidebar Drawer for Waypoint & Stop Configuration */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-10 w-96 max-w-full h-full bg-[#060a16] border-r border-[#1a2f52] shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 2. Main Full-Screen Application Viewport */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {/* Global Unified Navigation Bar */}
        <header className="flex items-center justify-between px-3 py-1.5 bg-[#060a16] border-b border-[#0d182b] flex-shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            {/* Logo */}
            <div
              className="flex items-center gap-1 font-bold tracking-wider text-xs cursor-pointer"
              onClick={() => setActiveTab('optimizer')}
            >
              <span className="text-[#00ff9d]">SMART</span>
              <span className="text-[#00f0ff]">RUTE-Q</span>
            </div>

            <span className="text-[#1a2f52]">|</span>

            {/* Waypoint & Origin Manager Trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 bg-[#0d1e3d] hover:bg-[#142d5c] border border-[#00f0ff]/50 text-white text-xs font-bold transition-all shadow-hud-cyan group"
              title="Configure Starting Origin & Delivery Destinations"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00f0ff] group-hover:rotate-90 transition-transform" />
              <span className="text-[#00f0ff]">LOCATIONS</span>
              <span className="px-1.5 py-0.2 bg-[#00ff9d] text-[#040711] text-[10px] font-bold">
                {stops.length} STOPS
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {startLocation ? `(🟢 ${startLocation.name.slice(0, 15)}...)` : '(No Origin Set)'}
              </span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === 'optimizer' && (activeTab as string) === 'dashboard');
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/50 font-bold'
                      : 'text-[#526685] hover:text-[#cbd5e1] border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1 bg-[#ff3b30] text-white text-[9px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => runOptimization()}
              disabled={isOptimizing}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#040711] font-bold text-xs shadow-hud-cyan transition-all disabled:opacity-50"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{isOptimizing ? 'SOLVING...' : 'RUN SOLVER'}</span>
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-2 py-1 text-xs text-[#526685] hover:text-white border border-[#1a2f52] transition-all"
            >
              DOCS
            </button>
          </div>
        </header>

        {/* Global Road Hazard Warning Banner */}
        {hasBlockedHazard && activeTab !== 'vision' && (
          <div className="p-2 bg-[#ff3b30]/15 border-b border-[#ff3b30]/40 flex items-center justify-between text-xs px-4 flex-shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#ff3b30]">
              <AlertTriangle className="w-4 h-4 animate-bounce flex-shrink-0" />
              <span className="font-bold">CRITICAL ROAD BLOCKAGE DETECTED:</span>
              <span className="text-slate-300">YOLOv8 vision model reported high severe corridor penalty.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('vision')}
                className="px-2 py-0.5 bg-[#060a16] hover:bg-[#0d182b] text-slate-200 border border-[#1a2f52] text-[11px]"
              >
                Inspect
              </button>
              <button
                onClick={() => runOptimization()}
                disabled={isOptimizing}
                className="px-2.5 py-0.5 bg-[#ff3b30] hover:bg-[#ff3b30]/80 text-white font-bold text-[11px] flex items-center gap-1 shadow-lg"
              >
                <Zap className="w-3 h-3 text-[#ffb700]" />
                <span>Re-Route Fleet</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Main Page Content View */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          {(activeTab === 'optimizer' || activeTab === 'dashboard') && <Dashboard />}
          {activeTab === 'results' && (
            <div className="h-full overflow-y-auto p-4">
              <ResultsPage />
            </div>
          )}
          {activeTab === 'vision' && (
            <div className="h-full overflow-y-auto p-4">
              <VisionRadar />
            </div>
          )}
          {activeTab === 'benchmark' && (
            <div className="h-full overflow-y-auto p-4">
              <BenchmarkLab />
            </div>
          )}
          {activeTab === 'graph' && (
            <div className="h-full overflow-y-auto p-4">
              <NetworkGraph />
            </div>
          )}
          {activeTab === 'history' && (
            <div className="h-full overflow-y-auto p-4">
              <RunHistory />
            </div>
          )}
        </div>

        {/* Floating Quick Action Trigger for Waypoints on Cockpit View */}
        {(activeTab === 'optimizer' || activeTab === 'dashboard') && (
          <div className="fixed bottom-2 left-2 z-40 flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#060a16]/90 hover:bg-[#0d1e3d] border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold transition-all shadow-hud-cyan"
              title="Open Waypoints & Stop Manager"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>EDIT STOPS ({stops.length})</span>
            </button>

            {/* Quick Tab Switcher Dock */}
            <div className="flex items-center bg-[#060a16]/90 border border-[#0d182b] p-0.5 text-[10px]">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id || (tab.id === 'optimizer' && activeTab === 'dashboard');
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-2 py-0.5 transition-all ${
                      isActive
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold'
                        : 'text-[#526685] hover:text-[#cbd5e1]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* System Documentation & SIH Guide Modal */}
        <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>
    </div>
  );
};

export default App;
