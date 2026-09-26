import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useOptimize } from '../hooks/useOptimize';
import { api } from '../services/api';
import {
  Zap,
  Sliders,
  Compass,
  Cpu,
  Truck,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const RouteControls: React.FC = () => {
  const {
    algorithm,
    setAlgorithm,
    fleetSize,
    setFleetSize,
    vehicleCapacity,
    setVehicleCapacity,
    isRoundTrip,
    setIsRoundTrip,
    trafficEnabled,
    setTrafficEnabled,
    trafficHour,
    setTrafficHour,
    hazardsEnabled,
    setHazardsEnabled,
    algorithmParams,
    setAlgorithmParams,
    isOptimizing,
    liveProgress,
    setStartLocation,
    setStops,
    stops
  } = useAppStore();

  const { runOptimization } = useOptimize();

  const [selectedCity, setSelectedCity] = useState('Delhi, India');
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  useEffect(() => {
    // Load city presets
    api.getGraphSamples().then((data) => {
      if (data && data.cities) {
        setCitiesList(data.cities);
      }
    }).catch(() => {});
  }, []);

  const handleCitySelect = async (cityName: string) => {
    setSelectedCity(cityName);
    setIsLoadingCity(true);
    try {
      const graphData = await api.loadGraph(cityName, 20, 'osmnx', trafficHour);
      if (graphData && graphData.nodes && graphData.nodes.length > 0) {
        setStartLocation(graphData.nodes[0]);
        setStops(graphData.nodes.slice(1, 15));
      }
    } catch (e) {
      console.error('Error loading city graph:', e);
    } finally {
      setIsLoadingCity(false);
    }
  };

  const algorithms = [
    { id: 'QPSO', name: 'QPSO (Quantum Swarm)', badge: 'Recommended • SIH 26137' },
    { id: 'Classical PSO', name: 'Classical PSO', badge: 'Standard Metaheuristic' },
    { id: 'Genetic Algorithm', name: 'Genetic Algorithm (GA)', badge: 'Evolutionary' },
    { id: 'Ant Colony', name: 'Ant Colony (ACO)', badge: 'Pheromone Trail' },
    { id: 'Simulated Annealing', name: 'Simulated Annealing', badge: 'Thermodynamic' },
    { id: 'Exact Solver', name: 'Exact (Branch & Bound)', badge: 'Deterministic' },
  ];

  const isPeakHour = (trafficHour >= 8 && trafficHour <= 10) || (trafficHour >= 17 && trafficHour <= 19.5);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cobalt-500/10 text-cobalt-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="font-display font-bold text-sm text-white tracking-wide">
            Mission Dispatch Controls
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
          {stops.length} Nodes Loaded
        </span>
      </div>

      {/* City Network Topology Preset */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold font-display text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cobalt-400" />
            <span>Target Metro Network (OSMnx)</span>
          </span>
          {isLoadingCity && <span className="text-[10px] text-mint-400 font-mono animate-pulse">Extracting graph...</span>}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleCitySelect(e.target.value)}
          disabled={isLoadingCity || isOptimizing}
          aria-label="Target Metro Network"
          className="w-full bg-carbon-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-cobalt-500 focus:outline-none transition-colors"
        >
          <option value="Delhi, India">🇮🇳 New Delhi (Central Logistics Corridor)</option>
          <option value="Mumbai, India">🇮🇳 Mumbai (Coastal Metro & Ports)</option>
          <option value="Bengaluru, India">🇮🇳 Bengaluru (Electronic City Hub)</option>
          <option value="Pune, India">🇮🇳 Pune (Industrial Auto Belt)</option>
          <option value="Hyderabad, India">🇮🇳 Hyderabad (HITEC Logistics Ring)</option>
        </select>
      </div>

      {/* Metaheuristic Algorithm Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold font-display text-slate-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-mint-400" />
          <span>Routing Optimization Engine</span>
        </label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isOptimizing}
          aria-label="Routing Optimization Engine"
          className="w-full bg-carbon-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-cobalt-500 focus:outline-none transition-colors font-mono"
        >
          {algorithms.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.name} ({algo.badge})
            </option>
          ))}
        </select>
      </div>

      {/* Fleet Size & Vehicle Capacity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold font-display text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-cobalt-400" /> Fleet Units
            </span>
            <span className="font-mono text-mint-400 text-[11px] font-bold">{fleetSize}</span>
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={fleetSize}
            onChange={(e) => setFleetSize(parseInt(e.target.value))}
            disabled={isOptimizing}
            aria-label="Fleet Units"
            className="w-full accent-cobalt-500 bg-carbon-900 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold font-display text-slate-300 flex items-center justify-between">
            <span>Payload Cap (kg)</span>
            <span className="font-mono text-cobalt-400 text-[11px] font-bold">
              {vehicleCapacity > 0 ? `${vehicleCapacity} kg` : 'No Limit'}
            </span>
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={vehicleCapacity}
            onChange={(e) => setVehicleCapacity(parseInt(e.target.value) || 0)}
            disabled={isOptimizing}
            placeholder="0 = unconstrained"
            className="w-full bg-carbon-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-cobalt-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dynamic Traffic Simulator Clock */}
      <div className="space-y-2 p-3 rounded-xl bg-carbon-900/80 border border-white/[0.06]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-semibold flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time of Day (Traffic Dynamics)</span>
          </span>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
              isPeakHour
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-mint-500/20 text-mint-300 border border-mint-500/30'
            }`}
          >
            {Math.floor(trafficHour).toString().padStart(2, '0')}:
            {Math.round((trafficHour % 1) * 60).toString().padStart(2, '0')}{' '}
            {isPeakHour ? '• Peak Surge' : '• Normal Flow'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={23.5}
          step={0.5}
          value={trafficHour}
          onChange={(e) => setTrafficHour(parseFloat(e.target.value))}
          disabled={isOptimizing}
          aria-label="Time of Day"
          className="w-full accent-amber-500 bg-carbon-950 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>00:00 (Night)</span>
          <span>08:30 (Peak)</span>
          <span>14:00 (Mid)</span>
          <span>18:30 (Evening)</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label className="flex items-center gap-2 p-2 rounded-xl bg-carbon-900/60 border border-white/[0.06] cursor-pointer hover:bg-carbon-850 transition-colors">
          <input
            type="checkbox"
            checked={isRoundTrip}
            onChange={(e) => setIsRoundTrip(e.target.checked)}
            disabled={isOptimizing}
            className="rounded accent-cobalt-500 bg-carbon-950 border-white/[0.1]"
          />
          <span className="text-[11px] font-medium text-slate-300">Return to Depot</span>
        </label>

        <label className="flex items-center gap-2 p-2 rounded-xl bg-carbon-900/60 border border-white/[0.06] cursor-pointer hover:bg-carbon-850 transition-colors">
          <input
            type="checkbox"
            checked={hazardsEnabled}
            onChange={(e) => setHazardsEnabled(e.target.checked)}
            disabled={isOptimizing}
            className="rounded accent-cobalt-500 bg-carbon-950 border-white/[0.1]"
          />
          <span className="text-[11px] font-medium text-slate-300">CV Hazard Avoidance</span>
        </label>
      </div>

      {/* Advanced QPSO Parameters Dropdown */}
      <div>
        <button
          onClick={() => setShowAdvancedParams(!showAdvancedParams)}
          className="flex items-center justify-between w-full text-[11px] font-display font-medium text-slate-400 hover:text-slate-200 py-1"
        >
          <span>Quantum Wave Parameters (Delta Well Mechanics)</span>
          {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvancedParams && (
          <div className="mt-2 p-3 rounded-xl bg-carbon-900 border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Swarm Size (Particles)</span>
              <input
                type="number"
                value={algorithmParams.swarm_size || 50}
                onChange={(e) =>
                  setAlgorithmParams({ ...algorithmParams, swarm_size: parseInt(e.target.value) || 50 })
                }
                className="w-16 bg-carbon-950 border border-white/[0.1] rounded px-2 py-0.5 text-right font-mono text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Contraction-Expansion (Beta)</span>
              <input
                type="number"
                step={0.1}
                value={algorithmParams.beta || 1.2}
                onChange={(e) =>
                  setAlgorithmParams({ ...algorithmParams, beta: parseFloat(e.target.value) || 1.2 })
                }
                className="w-16 bg-carbon-950 border border-white/[0.1] rounded px-2 py-0.5 text-right font-mono text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Max Iterations</span>
              <input
                type="number"
                value={algorithmParams.max_iter || 600}
                onChange={(e) =>
                  setAlgorithmParams({ ...algorithmParams, max_iter: parseInt(e.target.value) || 600 })
                }
                className="w-16 bg-carbon-950 border border-white/[0.1] rounded px-2 py-0.5 text-right font-mono text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Execution Button */}
      <button
        onClick={() => runOptimization()}
        disabled={isOptimizing}
        className="w-full btn-primary-action py-3 px-4 rounded-xl text-white font-display font-semibold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Zap className={`w-4 h-4 ${isOptimizing ? 'animate-spin text-cobalt-300' : 'text-amber-300 fill-amber-300'}`} />
        <span>{isOptimizing ? `Optimizing Trajectories (${liveProgress.toFixed(0)}%)...` : '⚡ EXECUTE QUANTUM DISPATCH'}</span>
      </button>
    </div>
  );
};

export default RouteControls;
