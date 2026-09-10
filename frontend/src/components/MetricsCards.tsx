import React from 'react';
import { useAppStore } from '../store/appStore';
import { Route, Clock, Fuel, IndianRupee, ShieldCheck, AlertTriangle } from 'lucide-react';

export const MetricsCards: React.FC = () => {
  const { optimizedResult } = useAppStore();

  if (!optimizedResult) return null;

  const { metrics } = optimizedResult;
  const hours = Math.floor(metrics.duration_min / 60);
  const mins = Math.round(metrics.duration_min % 60);

  const isFeasible = metrics.feasibility?.is_feasible ?? true;

  return (
    <div className="space-y-4">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Distance */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-roboto">Total Distance</span>
            <Route className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyber-cyan neon-text-cyan">
            {metrics.distance_km.toFixed(1)} <span className="text-xs font-normal">km</span>
          </div>
        </div>

        {/* Travel Time */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-roboto">Est. Driving Time</span>
            <Clock className="w-4 h-4 text-cyber-orange group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyber-orange">
            {hours}h {mins}m
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-roboto">Fuel Usage</span>
            <Fuel className="w-4 h-4 text-cyber-neonPurple group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyber-neonPurple neon-text-purple">
            {metrics.fuel_liters.toFixed(1)} <span className="text-xs font-normal">L</span>
          </div>
        </div>

        {/* Cost */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-roboto">Operational Cost</span>
            <IndianRupee className="w-4 h-4 text-cyber-green group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyber-green">
            ₹{metrics.cost_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Feasibility Alert Banner */}
      <div
        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          isFeasible
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isFeasible ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>
            {isFeasible
              ? 'All vehicle capacity & customer time-window constraints are fully satisfied.'
              : `Warning: ${metrics.feasibility?.overloaded_vehicles} vehicle(s) exceeded capacity limits.`}
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold uppercase">
          {isFeasible ? '✅ Feasible Solution' : '❌ Capacity Penalty Applied'}
        </span>
      </div>

      {/* Fleet Breakdown (if multi-vehicle) */}
      {metrics.vehicles && metrics.vehicles.length > 1 && (
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-xs font-orbitron text-gray-300 mb-2 font-semibold">
            🚛 Fleet Workload Split
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {metrics.vehicles.map((v) => (
              <div key={v.vehicle_id} className="bg-[#0b1021]/80 p-2.5 rounded-lg border border-cyan-500/20 text-xs">
                <div className="text-cyan-400 font-bold font-orbitron">Vehicle {v.vehicle_id}</div>
                <div className="text-gray-300 mt-1">{v.distance_km} km • {Math.round(v.duration_min)} min</div>
                <div className="text-gray-400 text-[10px] mt-0.5">{v.stops_count} delivery stops</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
