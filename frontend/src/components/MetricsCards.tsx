import React from 'react';
import { useAppStore } from '../store/appStore';
import { 
  Navigation, 
  Clock, 
  Fuel, 
  Coins, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  TrendingDown, 
  Gauge,
  Sparkles,
  Zap
} from 'lucide-react';

export const MetricsCards: React.FC = () => {
  const { optimizedResult } = useAppStore();

  if (!optimizedResult) return null;

  const metrics = optimizedResult.metrics || {
    distance_km: optimizedResult.total_distance_km ?? 0,
    duration_min: optimizedResult.total_duration_min ?? 0,
    fuel_liters: (optimizedResult.total_distance_km ?? 0) / 4.5,
    cost_inr: optimizedResult.total_cost ?? 0,
    vehicles: optimizedResult.vehicles ?? [],
    feasibility: { is_feasible: true, overloaded_vehicles: 0 },
  };

  const distanceKm = Number(metrics.distance_km ?? 0);
  const durationMin = Number(metrics.duration_min ?? 0);
  const fuelLiters = Number(metrics.fuel_liters ?? (distanceKm > 0 ? distanceKm / 4.5 : 0));
  const costInr = Number(metrics.cost_inr ?? 0);

  const hours = Math.floor(durationMin / 60);
  const mins = Math.round(durationMin % 60);
  const isFeasible = metrics.feasibility?.is_feasible ?? true;
  const vehicles = metrics.vehicles || [];

  return (
    <div className="space-y-3 select-none font-mono text-[#cbd5e1]">
      {/* 4 Core Mission KPI Cards (Full Width Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Distance */}
        <div className="hud-box p-3.5 relative overflow-hidden flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="flex items-center justify-between text-[#526685] mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#00f0ff]">Total Distance</span>
            <Navigation className="w-3.5 h-3.5 text-[#00f0ff]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#00f0ff] font-mono tracking-tight">
              {distanceKm.toFixed(1)}
            </span>
            <span className="text-xs text-[#00f0ff] font-mono">km</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#00ff9d]">
            <TrendingDown className="w-3 h-3 text-[#00ff9d]" />
            <span>Optimal QPSO path</span>
          </div>
        </div>

        {/* Transit Duration */}
        <div className="hud-box p-3.5 relative overflow-hidden flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="flex items-center justify-between text-[#526685] mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#00ff9d]">Transit Duration</span>
            <Clock className="w-3.5 h-3.5 text-[#00ff9d]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#00ff9d] font-mono tracking-tight">
              {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#526685]">
            <Gauge className="w-3 h-3 text-[#00f0ff]" />
            <span>Traffic calibrated</span>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="hud-box p-3.5 relative overflow-hidden flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="flex items-center justify-between text-[#526685] mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#ffb700]">Fuel Burn</span>
            <Fuel className="w-3.5 h-3.5 text-[#ffb700]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#ffb700] font-mono tracking-tight">
              {fuelLiters.toFixed(1)}
            </span>
            <span className="text-xs text-[#ffb700] font-mono">L</span>
          </div>
          <div className="mt-1 text-[10px] text-[#526685]">
            ~₹{(fuelLiters * 96.0).toFixed(0)} budget
          </div>
        </div>

        {/* Energy Cost Score */}
        <div className="hud-box p-3.5 relative overflow-hidden flex flex-col justify-between">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="flex items-center justify-between text-[#526685] mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#bf5af2]">Energy Metric</span>
            <Coins className="w-3.5 h-3.5 text-[#bf5af2]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-2xl font-bold text-[#bf5af2] font-mono tracking-tight">
              ₹{costInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-[#526685]">
            Multi-objective score
          </div>
        </div>
      </div>

      {/* Constraints & Feasibility Status Ribbon */}
      <div
        className={`px-3.5 py-2.5 hud-box flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          isFeasible
            ? 'border-[#00ff9d]/30 text-[#00ff9d]'
            : 'border-[#ff3b30]/30 text-[#ff3b30]'
        }`}
      >
        <div className="flex items-center gap-2">
          {isFeasible ? (
            <ShieldCheck className="w-4 h-4 text-[#00ff9d] flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#ff3b30] flex-shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs">
            {isFeasible
              ? 'Constraint Compliance: All vehicle capacities & delivery time-windows satisfied.'
              : `Constraint Alert: ${metrics.feasibility?.overloaded_vehicles ?? 1} vehicle(s) exceed rated payload capacity.`}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
            isFeasible ? 'bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40' : 'bg-[#ff3b30]/20 text-[#ff3b30] border border-[#ff3b30]/40'
          }`}
        >
          {isFeasible ? '100% FEASIBLE' : 'CAPACITY OVERLOAD'}
        </span>
      </div>
    </div>
  );
};

export default MetricsCards;
