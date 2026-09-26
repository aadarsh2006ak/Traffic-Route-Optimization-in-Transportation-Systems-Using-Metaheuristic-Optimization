import React, { useState, useEffect } from 'react';
import { GraphView } from '../components/GraphView';
import { BookOpen, Clock, TrendingUp, Zap, ShieldCheck, Activity, Compass, Network } from 'lucide-react';
import axios from 'axios';

export const NetworkGraph: React.FC = () => {
  const [simHour, setSimHour] = useState<number>(8.5);
  const [trafficData, setTrafficData] = useState<any>(null);

  useEffect(() => {
    fetchTrafficDemo(simHour);
  }, [simHour]);

  const fetchTrafficDemo = async (hour: number) => {
    try {
      const rawBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const cleanBase = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
      const res = await axios.get(`${cleanBase}/api/v1/graph/dynamic-traffic-demo?hour=${hour}`);
      if (res.data && res.data.status === 'success') {
        setTrafficData(res.data);
      }
    } catch {
      // Analytical calculation fallback
      const morningPeak = 0.7 * Math.exp(-Math.pow(hour - 8.5, 2) / (2 * 1.0));
      const eveningPeak = 0.8 * Math.exp(-Math.pow(hour - 18.0, 2) / (2 * 1.44));
      const midday = 0.25 * Math.exp(-Math.pow(hour - 13.5, 2) / (2 * 2.25));
      const factor = 1.0 + morningPeak + eveningPeak + midday;
      setTrafficData({
        traffic_factor_theta: factor,
        traffic_status: {
          level: factor > 1.5 ? 'Heavy Congestion' : factor > 1.2 ? 'Moderate Delay' : 'Smooth Flow',
          color: factor > 1.5 ? '#ef4444' : factor > 1.2 ? '#f59e0b' : '#10b981',
          multiplier: factor.toFixed(2),
        },
        sample_edge_weight_evaluation: {
          base_distance_km: 10.0,
          free_flow_time_min: 13.33,
          effective_congested_time_min: 13.33 * factor,
          added_traffic_delay_min: 13.33 * (factor - 1.0),
          composite_cost_weight: 80.0 + ((13.33 * factor) / 60.0) * 50.0,
        },
      });
    }
  };

  const formatHour = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h % 1) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Network Topology Graph */}
      <GraphView />

      {/* 2. Interactive Dynamic Weight Update Mechanism (Deliverable 1 Live Demo) */}
      <div className="glass-surface p-5 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-syne font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Deliverable 1: Live Dynamic Road Edge Weight Mechanism θ(t)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrates continuous time-dependent edge weight updates evaluated during vehicle transit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
              style={{
                backgroundColor: `${trafficData?.traffic_status?.color || '#10b981'}20`,
                borderColor: trafficData?.traffic_status?.color || '#10b981',
                color: trafficData?.traffic_status?.color || '#10b981',
              }}
            >
              {trafficData?.traffic_status?.level || 'Active'} (θ = {trafficData?.traffic_factor_theta?.toFixed(2)}x)
            </span>
          </div>
        </div>

        {/* Time Slider Control */}
        <div className="space-y-2.5 bg-[#090d16] p-4 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-syne">
              <Clock className="w-3.5 h-3.5 text-solar-400" /> Traversal / Dispatch Hour:
            </span>
            <span className="text-emerald-400 font-bold font-syne text-sm">
              {formatHour(simHour)} ({simHour.toFixed(1)}h)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="23.5"
            step="0.5"
            value={simHour}
            onChange={(e) => setSimHour(parseFloat(e.target.value))}
            aria-label="Traversal Hour"
            className="w-full accent-solar-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>00:00 (Night)</span>
            <span className="text-solar-400 font-bold">08:30 (Morning Peak)</span>
            <span>13:30 (Midday)</span>
            <span className="text-rose-400 font-bold">18:00 (Evening Peak)</span>
            <span>23:30 (Off-Peak)</span>
          </div>
        </div>

        {/* Dynamic Edge Impact Metrics */}
        {trafficData?.sample_edge_weight_evaluation && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-[#090d16] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Base Distance</span>
              <span className="text-base font-bold text-white font-syne">
                {trafficData.sample_edge_weight_evaluation.base_distance_km} km
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Free-Flow: 13.3 min</span>
            </div>

            <div className="p-3.5 bg-[#090d16] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Congestion Factor θ(t)</span>
              <span className="text-base font-bold text-emerald-400 font-syne">
                {trafficData.traffic_factor_theta?.toFixed(3)}x
              </span>
              <span className="text-[10px] text-emerald-400/80 block font-mono">
                +{((trafficData.traffic_factor_theta - 1.0) * 100).toFixed(1)}% Delay
              </span>
            </div>

            <div className="p-3.5 bg-[#090d16] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Effective Travel Time</span>
              <span className="text-base font-bold text-solar-400 font-syne">
                {trafficData.sample_edge_weight_evaluation.effective_congested_time_min?.toFixed(1)} min
              </span>
              <span className="text-[10px] text-solar-400/80 block font-mono">
                +{trafficData.sample_edge_weight_evaluation.added_traffic_delay_min?.toFixed(1)}m surge
              </span>
            </div>

            <div className="p-3.5 bg-[#090d16] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Composite Energy Cost</span>
              <span className="text-base font-bold text-indigo-400 font-syne">
                ₹{trafficData.sample_edge_weight_evaluation.composite_cost_weight?.toFixed(1)}
              </span>
              <span className="text-[10px] text-indigo-400/80 block font-mono">Distance + Time</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Mathematical Theory & Formal Constraints (Deliverable 2) */}
      <div className="glass-surface p-5 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="font-syne font-bold text-sm text-white flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Deliverable 2: Mathematical Formulation & Constraints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-300">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h4 className="font-syne text-emerald-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Objective Function</span>
            </h4>
            <p className="font-mono text-[11px] text-emerald-400 bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
              min Z = ∑_k ∑_i ∑_j c_ij(t)·x_ijk + P_TW + P_Cap
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              c_ij(t) = base_dist × θ(t) × γ_hazard. Minimizes fleet travel distance, time-in-transit, and penalty multipliers.
            </p>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h4 className="font-syne text-indigo-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Decision Variables & Flow</span>
            </h4>
            <p className="font-mono text-[11px] text-indigo-400 bg-black/40 p-2.5 rounded-lg border border-indigo-500/20">
              x_ijk ∈ {'{0,1}'}, y_ik ∈ {'{0,1}'}, s_ik ≥ 0
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Enforces flow conservation ∑_j x_ijk = ∑_j x_jik = y_ik, single stop visits, and depot start/end continuity.
            </p>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h4 className="font-syne text-solar-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-solar-400" />
              <span>QPSO Wavefunction Update</span>
            </h4>
            <p className="font-mono text-[11px] text-solar-400 bg-black/40 p-2.5 rounded-lg border border-solar-500/20">
              X_id(t+1) = p_id ± β(t)·|mBest_d - X_id|·ln(1/u)
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Delta-potential well Schrödinger model with dynamic contraction β(t): 1.2 → 0.5 for quantum tunneling escape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
