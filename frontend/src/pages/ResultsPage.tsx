import React from 'react';
import { useAppStore } from '../store/appStore';
import { MetricsCards } from '../components/MetricsCards';
import { BenchmarkTable } from '../components/BenchmarkTable';
import { ConvergenceChart } from '../components/ConvergenceChart';
import { MapView } from '../components/MapView';
import {
  Award,
  Truck,
  Download,
  Navigation,
  Clock,
  Zap,
  ChevronRight,
  Package,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const ResultsPage: React.FC = () => {
  const { optimizedResult, benchmarkResults, algorithm, fleetSize } = useAppStore();

  const vehicles = optimizedResult?.vehicles || [];

  const vehiclePalette = [
    '#00f0ff', // Cyan
    '#00ff9d', // Mint
    '#ffb700', // Amber
    '#bf5af2', // Purple
    '#ff3b30', // Rose
  ];

  return (
    <div className="space-y-4 font-mono text-[#cbd5e1] select-none animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="hud-box p-4 relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
              <span>FLEET DISPATCH MANIFEST & TELEMETRY</span>
              <span className="px-2 py-0.5 bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[10px] text-[#00f0ff] font-bold">
                {algorithm} ENGINE
              </span>
            </h1>
            <p className="text-xs text-[#526685]">
              Real-time vehicle trajectories, sequential dispatch timeline, and multi-objective performance audit
            </p>
          </div>
        </div>

        {benchmarkResults?.run_id && (
          <button
            onClick={() => window.open(api.getBenchmarkCsvUrl(benchmarkResults.run_id), '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1e3d] hover:bg-[#142d5c] border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold transition-all shadow-hud-cyan"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV MANIFEST</span>
          </button>
        )}
      </div>

      {/* 2. Primary KPI Cards */}
      <MetricsCards />

      {/* 3. Main Spacious Split View: Large Map (7 cols) + Large Dispatch Ledger (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map View Port (Large Generous Height) */}
        <div className="lg:col-span-7 h-[540px] sm:h-[600px] lg:h-[640px] hud-box relative overflow-hidden">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />
          <MapView />
        </div>

        {/* Turn-by-Turn Manifest List (Matching Large Height) */}
        <div className="lg:col-span-5 h-[540px] sm:h-[600px] lg:h-[640px] hud-box p-4 relative flex flex-col overflow-hidden">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          {/* Card Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#0d182b] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#00f0ff]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                FLEET TURN-BY-TURN MANIFEST ({vehicles.length || fleetSize || 1} VEHICLES)
              </h3>
            </div>
            <span className="text-[10px] text-[#526685]">Sequential Order</span>
          </div>

          {/* Vehicle Routes List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pt-3">
            {vehicles.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#526685] space-y-2">
                <Package className="w-10 h-10 text-[#1a2f52] mx-auto animate-pulse" />
                <p className="text-slate-300 font-bold">No active vehicle schedules generated yet.</p>
                <p className="text-[10px] text-[#526685]">Execute optimization from the Cockpit to generate turn-by-turn fleet dispatch sequences.</p>
              </div>
            ) : (
              vehicles.map((v: any, idx: number) => {
                const vColor = vehiclePalette[idx % vehiclePalette.length];
                const vId = v.vehicle_id || idx + 1;
                const vDist = v.distance_km || 0;
                const vDur = v.duration_min || 0;
                const vStops = v.route_path || [];
                const load = v.load || (vStops.length * 2);
                const capacity = v.capacity || 20;
                const fillPct = Math.min(100, Math.round((load / capacity) * 100));

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#060a16] border border-[#0d182b] hover:border-[#1a2f52] transition-all space-y-2.5"
                  >
                    {/* Vehicle Header Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: vColor, boxShadow: `0 0 10px ${vColor}` }}
                        />
                        <span className="font-bold text-xs text-white">
                          Vehicle Unit #{vId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#00ff9d]">{vDist.toFixed(1)} km</span>
                        <span className="text-[#526685]">•</span>
                        <span className="text-[#00f0ff]">{Math.round(vDur)} min</span>
                      </div>
                    </div>

                    {/* Capacity Load Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#526685]">
                        <span>Payload Fill</span>
                        <span className="text-slate-300 font-bold">{load} kg / {capacity} kg ({fillPct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#040711] overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${fillPct}%`, backgroundColor: vColor }}
                        />
                      </div>
                    </div>

                    {/* Turn-by-Turn Waypoints Sequence */}
                    {vStops.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] text-[#526685] uppercase tracking-wider">
                          Waypoint Schedule:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {vStops.map((stopName: string, sIdx: number) => (
                            <React.Fragment key={sIdx}>
                              <span className="px-2 py-1 bg-[#040711] text-slate-200 border border-[#0d182b] flex items-center gap-1">
                                <span className="text-[9px] text-[#00f0ff] font-bold">{sIdx + 1}.</span>
                                <span>{stopName}</span>
                              </span>
                              {sIdx < vStops.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-[#526685]" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Multi-Algorithm Convergence Trace */}
      <div className="h-80 hud-box relative overflow-hidden">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />
        <ConvergenceChart multiAlgorithmConvergence={benchmarkResults?.convergence} />
      </div>

      {/* 5. Benchmark Summary Table */}
      {benchmarkResults && benchmarkResults.summary_table && (
        <BenchmarkTable
          results={benchmarkResults.summary_table}
          runId={benchmarkResults.run_id}
        />
      )}
    </div>
  );
};

export default ResultsPage;
