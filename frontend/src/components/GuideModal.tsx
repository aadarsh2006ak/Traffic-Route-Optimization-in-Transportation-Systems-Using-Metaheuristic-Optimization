import React from 'react';
import { X, Cpu, Radio, Award, Network, Database, Compass, ShieldCheck, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-surface-elevated border border-white/[0.12] rounded-2xl shadow-2xl p-5 sm:p-7 space-y-6 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-syne font-bold text-white flex items-center gap-2">
                <span>QuantumRoute AI • Architecture & System Guide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIH 2026 PS 26137
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Quantum-Inspired Particle Swarm Optimization (QPSO) • Multi-Fleet VRP • Dynamic Road Dynamics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* 1. QPSO Optimizer */}
          <div className="p-4 rounded-xl bg-[#0a0e1a]/80 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 font-syne font-bold text-emerald-300">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>1. Quantum-Behaved Swarm (QPSO)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Based on the <strong>Delta-Potential Well model</strong> and Contraction-Expansion decay. Solves Capacitated Vehicle Routing with Delivery Time-Windows (CVRPTW) with rapid convergence.
            </p>
            <div className="text-[11px] text-emerald-300/90 font-mono bg-black/40 p-2 rounded-lg border border-emerald-500/20">
              👉 Pick a city network (Delhi/Mumbai), adjust vehicle capacity, and click "Execute Quantum Dispatch".
            </div>
          </div>

          {/* 2. Computer Vision Radar */}
          <div className="p-4 rounded-xl bg-[#0a0e1a]/80 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 font-syne font-bold text-rose-300">
              <Radio className="w-4 h-4 text-rose-400" />
              <span>2. CV Road Hazard Radar & Avoidance</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Detects road blockades, accidents, and potholes from CCTV / Dashcam frames. Automatically re-evaluates cost matrices with heavy penalties.
            </p>
            <div className="text-[11px] text-rose-300/90 font-mono bg-black/40 p-2 rounded-lg border border-rose-500/20">
              👉 Visit the "CV Vision Radar" tab to upload road frames or trigger incident presets.
            </div>
          </div>

          {/* 3. Multi-Solver Benchmark */}
          <div className="p-4 rounded-xl bg-[#0a0e1a]/80 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 font-syne font-bold text-indigo-300">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>3. Multi-Solver Benchmark Suite</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Runs head-to-head empirical evaluations comparing QPSO vs Classical PSO, Genetic Algorithm (GA), Ant Colony Optimization (ACO), and Exact Branch & Bound.
            </p>
            <div className="text-[11px] text-indigo-300/90 font-mono bg-black/40 p-2 rounded-lg border border-indigo-500/20">
              👉 Check the "Benchmark Suite" tab to launch multi-solver simulations and download CSV data.
            </div>
          </div>

          {/* 4. Real City OSMnx Networks */}
          <div className="p-4 rounded-xl bg-[#0a0e1a]/80 border border-solar-500/20 space-y-2">
            <div className="flex items-center gap-2 font-syne font-bold text-solar-300">
              <Network className="w-4 h-4 text-solar-400" />
              <span>4. OSMnx Cartography & Telemetry</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Extracts real OpenStreetMap road networks across major Indian corridors with time-varying congestion factors and SQLite history persistence.
            </p>
            <div className="text-[11px] text-solar-300/90 font-mono bg-black/40 p-2 rounded-lg border border-solar-500/20">
              👉 Check "Network Topology" for graph centrality, clustering, and road network density.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs font-mono text-slate-400">
          <span>Smart India Hackathon 2026 • PS ID: 26137</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-syne font-bold transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
