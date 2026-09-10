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
    <div className="space-y-3 sm:space-y-4">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Distance */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] sm:text-xs font-roboto">Total Distance</span>
            <Route className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <div className="font-orbitron text-lg sm:text-2xl font-bold text-cyan-400 neon-text-cyan">
            {metrics.distance_km.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">km</span>
          </div>
        </div>

        {/* Travel Time */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] sm:text-xs font-roboto">Driving Time</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <div className="font-orbitron text-lg sm:text-2xl font-bold text-orange-400">
            {hours}h {mins}m
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] sm:text-xs font-roboto">Fuel Usage</span>
            <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <div className="font-orbitron text-lg sm:text-2xl font-bold text-purple-400 neon-text-purple">
            {metrics.fuel_liters.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">L</span>
          </div>
        </div>

        {/* Cost */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] sm:text-xs font-roboto">Estimated Cost</span>
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <div className="font-orbitron text-lg sm:text-2xl font-bold text-emerald-400">
            ₹{metrics.cost_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Feasibility Alert Banner */}
      <div
        className={`p-2.5 sm:p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          isFeasible
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isFeasible ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs">
            {isFeasible
              ? 'All vehicle capacity & customer time-window constraints are satisfied.'
              : `Warning: ${metrics.feasibility?.overloaded_vehicles} vehicle(s) exceeded capacity limits.`}
          </span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase self-start sm:self-auto">
          {isFeasible ? '✅ Feasible' : '❌ Capacity Penalty'}
        </span>
      </div>

      {/* Fleet Breakdown (if multi-vehicle) */}
      {metrics.vehicles && metrics.vehicles.length > 1 && (
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-xs font-orbitron text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
            <span>🚛 Fleet Workload Split</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {metrics.vehicles.map((v) => (
              <div key={v.vehicle_id} className="bg-[#0b1021]/80 p-2 sm:p-2.5 rounded-lg border border-cyan-500/20 text-xs">
                <div className="text-cyan-400 font-bold font-orbitron text-[11px] sm:text-xs">Vehicle {v.vehicle_id}</div>
                <div className="text-gray-300 mt-1 text-[11px]">{v.distance_km} km • {Math.round(v.duration_min)} min</div>
                <div className="text-gray-400 text-[10px] mt-0.5">{v.stops_count} delivery stops</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
