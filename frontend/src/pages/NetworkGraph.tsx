import React from 'react';
import { GraphView } from '../components/GraphView';
import { Network, BookOpen } from 'lucide-react';

export const NetworkGraph: React.FC = () => {
  return (
    <div className="space-y-6">
      <GraphView />

      {/* Mathematical Theory & Formulation Card */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h3 className="font-orbitron font-bold text-sm text-purple-400 flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-purple-400" /> Graph-Based Modeling & Mathematical Formulation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300 font-sans">
          <div className="bg-[#050711]/60 p-3.5 rounded-lg border border-gray-800 space-y-2">
            <h4 className="font-orbitron text-cyan-300 font-semibold">1. Multi-Objective Cost Function</h4>
            <p className="font-mono text-[11px] text-cyan-400 bg-black/40 p-2 rounded">
              min Z = ∑ (c_fuel·d_ij + c_time·t_ij·θ(t)) x_ijk + ∑ P_TW + ∑ P_Cap
            </p>
            <p className="text-gray-400 text-[11px]">
              Weights incorporate true road distance, dynamic Gaussian congestion multipliers θ(t), customer time-window lateness penalties, and vehicle capacity bounds.
            </p>
          </div>

          <div className="bg-[#050711]/60 p-3.5 rounded-lg border border-gray-800 space-y-2">
            <h4 className="font-orbitron text-purple-300 font-semibold">2. QPSO Delta Potential Well Model</h4>
            <p className="font-mono text-[11px] text-purple-400 bg-black/40 p-2 rounded">
              X_id(t+1) = p_id ± β · |mBest_d - X_id| · ln(1/u)
            </p>
            <p className="text-gray-400 text-[11px]">
              Unlike classical PSO with Newtonian velocity clamping, QPSO operates via quantum wavefunction collapse around the local attractor point, enabling barrier penetration and local optima escape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
