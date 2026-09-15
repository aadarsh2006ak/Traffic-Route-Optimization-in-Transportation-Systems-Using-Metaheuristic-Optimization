import React, { useState, useEffect } from 'react';
import { GraphView } from '../components/GraphView';
import { BookOpen, Clock, TrendingUp, Zap, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export const NetworkGraph: React.FC = () => {
  const [simHour, setSimHour] = useState<number>(8.5);
  const [trafficData, setTrafficData] = useState<any>(null);

  useEffect(() => {
    fetchTrafficDemo(simHour);
  }, [simHour]);

  const fetchTrafficDemo = async (hour: number) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
      const res = await axios.get(`${apiBase}/graph/dynamic-traffic-demo?hour=${hour}`);
      if (res.data && res.data.status === 'success') {
        setTrafficData(res.data);
      }
    } catch {
      // Fallback calculation
      const morningPeak = 0.70 * Math.exp(-Math.pow(hour - 8.5, 2) / (2 * 1.0));
      const eveningPeak = 0.80 * Math.exp(-Math.pow(hour - 18.0, 2) / (2 * 1.44));
      const midday = 0.25 * Math.exp(-Math.pow(hour - 13.5, 2) / (2 * 2.25));
      const factor = 1.0 + morningPeak + eveningPeak + midday;
      setTrafficData({
        traffic_factor_theta: factor,
        traffic_status: {
          level: factor > 1.5 ? 'Heavy Congestion' : factor > 1.2 ? 'Moderate Delay' : 'Smooth Flow',
          color: factor > 1.5 ? '#ff2b2b' : factor > 1.2 ? '#ff9100' : '#00e5ff',
          multiplier: factor.toFixed(2),
        },
        sample_edge_weight_evaluation: {
          base_distance_km: 10.0,
          free_flow_time_min: 13.33,
          effective_congested_time_min: 13.33 * factor,
          added_traffic_delay_min: 13.33 * (factor - 1.0),
          composite_cost_weight: 80.0 + (13.33 * factor / 60.0) * 50.0,
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
    <div className="space-y-6">
      {/* 1. Network Topology Graph */}
      <GraphView />

      {/* 2. Interactive Dynamic Weight Update Mechanism (Deliverable 1 Live Demo) */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4 bg-gradient-to-r from-[#070a16] via-[#0a0f24] to-[#070a16]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <div>
            <h3 className="font-orbitron font-bold text-sm text-cyan-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Deliverable 1: Live Dynamic Edge Weight Mechanism Demo θ(t)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Demonstrates real-time time-dependent edge weight updates evaluated during vehicle transit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
              style={{
                backgroundColor: `${trafficData?.traffic_status?.color || '#00e5ff'}20`,
                borderColor: trafficData?.traffic_status?.color || '#00e5ff',
                color: trafficData?.traffic_status?.color || '#00e5ff',
              }}
            >
              {trafficData?.traffic_status?.level || 'Active'} (θ = {trafficData?.traffic_factor_theta?.toFixed(2)}x)
            </span>
          </div>
        </div>

        {/* Time Slider Control */}
        <div className="space-y-2 bg-[#050711]/80 p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Dispatch / Traversal Hour:
            </span>
            <span className="text-cyan-300 font-bold font-orbitron text-sm">
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
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-gray-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-gray-500 font-mono pt-1">
            <span>00:00 (Night)</span>
            <span className="text-amber-400 font-bold">08:30 (Morning Peak)</span>
            <span>13:30 (Midday)</span>
            <span className="text-red-400 font-bold">18:00 (Evening Rush)</span>
            <span>23:30 (Off-Peak)</span>
          </div>
        </div>

        {/* Dynamic Edge Impact Metrics */}
        {trafficData?.sample_edge_weight_evaluation && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#070a18] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 block font-mono">Sample Edge Base</span>
              <span className="text-base font-bold text-gray-100 font-orbitron">
                {trafficData.sample_edge_weight_evaluation.base_distance_km} km
              </span>
              <span className="text-[10px] text-gray-500 block">Free-Flow: 13.3 min</span>
            </div>

            <div className="p-3 bg-[#070a18] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 block font-mono">Congestion Factor θ(t)</span>
              <span className="text-base font-bold text-cyan-400 font-orbitron">
                {trafficData.traffic_factor_theta?.toFixed(3)}x
              </span>
              <span className="text-[10px] text-cyan-400/80 block">
                +{((trafficData.traffic_factor_theta - 1.0) * 100).toFixed(1)}% Delay
              </span>
            </div>

            <div className="p-3 bg-[#070a18] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 block font-mono">Effective Travel Time</span>
              <span className="text-base font-bold text-amber-400 font-orbitron">
                {trafficData.sample_edge_weight_evaluation.effective_congested_time_min?.toFixed(1)} min
              </span>
              <span className="text-[10px] text-amber-500/80 block">
                +{trafficData.sample_edge_weight_evaluation.added_traffic_delay_min?.toFixed(1)} min delay
              </span>
            </div>

            <div className="p-3 bg-[#070a18] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 block font-mono">Composite Cost Weight</span>
              <span className="text-base font-bold text-purple-400 font-orbitron">
                ₹{trafficData.sample_edge_weight_evaluation.composite_cost_weight?.toFixed(1)}
              </span>
              <span className="text-[10px] text-purple-400/80 block">Cost + Energy Score</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Mathematical Theory & Formal Constraints (Deliverable 2 Ready-to-Audit) */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="font-orbitron font-bold text-sm text-purple-400 flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-purple-400" /> Deliverable 2: Formal Mathematical Model & Constraints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300 font-sans">
          <div className="bg-[#050711]/80 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <h4 className="font-orbitron text-cyan-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Objective Function</span>
            </h4>
            <p className="font-mono text-[11px] text-cyan-400 bg-black/50 p-2 rounded border border-cyan-500/20">
              min Z = ∑_k ∑_i ∑_j c_ij(t)·x_ijk + P_TW + P_Cap
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              c_ij(t) = base_dist × θ(t) × γ_hazard. Minimizes total fleet fuel, driver hours, and constraint violations.
            </p>
          </div>

          <div className="bg-[#050711]/80 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <h4 className="font-orbitron text-purple-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Decision Variables & Flow</span>
            </h4>
            <p className="font-mono text-[11px] text-purple-400 bg-black/50 p-2 rounded border border-purple-500/20">
              x_ijk ∈ {'{0,1}'}, y_ik ∈ {'{0,1}'}, s_ik ≥ 0
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Enforces flow conservation ∑_j x_ijk = ∑_j x_jik = y_ik, single stop visits, and depot start/end continuity.
            </p>
          </div>

          <div className="bg-[#050711]/80 p-3.5 rounded-xl border border-gray-800 space-y-2">
            <h4 className="font-orbitron text-emerald-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>QPSO Wavefunction Update</span>
            </h4>
            <p className="font-mono text-[11px] text-emerald-400 bg-black/50 p-2 rounded border border-emerald-500/20">
              X_id(t+1) = p_id ± β(t)·|mBest_d - X_id|·ln(1/u)
            </p>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Delta-potential well Schrödinger model with dynamic contraction β(t): 1.2 → 0.5 for quantum tunneling escape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
