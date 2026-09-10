import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useOptimize } from '../hooks/useOptimize';
import { api, LocationNode } from '../api/client';
import {
  Search,
  Plus,
  Trash2,
  Upload,
  Cpu,
  Truck,
  Zap,
  Clock,
  Settings,
  Fuel,
  Activity,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    startLocation,
    setStartLocation,
    stops,
    addStop,
    removeStop,
    clearStops,
    setStops,
    algorithm,
    setAlgorithm,
    fleetSize,
    setFleetSize,
    vehicleCapacity,
    setVehicleCapacity,
    isRoundTrip,
    setIsRoundTrip,
    mileage,
    setMileage,
    fuelPrice,
    setFuelPrice,
    trafficEnabled,
    setTrafficEnabled,
    trafficHour,
    setTrafficHour,
    algorithmParams,
    setAlgorithmParams,
    isOptimizing,
    liveProgress,
  } = useAppStore();

  const { runOptimization, error } = useOptimize();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'start' | 'stop'>('stop');

  // Handle Autocomplete Search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await api.searchPlaces(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectResult = (loc: LocationNode) => {
    if (searchTarget === 'start') {
      setStartLocation(loc);
    } else {
      addStop(loc);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Demo Datasets
  const loadDemoDataset = (count: number) => {
    if (count === 10) {
      setStartLocation({ name: 'Connaught Place, New Delhi', coords: [28.6315, 77.2167], demand: 0 });
      setStops([
        { name: 'India Gate, New Delhi', coords: [28.6129, 77.2295], demand: 2, window: [9, 12] },
        { name: 'Red Fort, Delhi', coords: [28.6562, 77.241], demand: 1, window: [10, 14] },
        { name: 'Lotus Temple, New Delhi', coords: [28.5535, 77.2588], demand: 3, window: [11, 15] },
        { name: 'Qutub Minar, New Delhi', coords: [28.5244, 77.1855], demand: 2, window: [12, 16] },
        { name: 'Akshardham Temple, Delhi', coords: [28.6127, 77.2773], demand: 1, window: [9, 13] },
        { name: 'Hauz Khas Village, New Delhi', coords: [28.5534, 77.1945], demand: 2, window: [13, 17] },
        { name: 'Cyber Hub, Gurugram', coords: [28.4952, 77.0886], demand: 3, window: [10, 16] },
        { name: 'Noida Sector 18, Noida', coords: [28.5708, 77.3271], demand: 2, window: [11, 17] },
        { name: 'Karol Bagh, New Delhi', coords: [28.6517, 77.1906], demand: 1, window: [9, 14] },
      ]);
    } else if (count === 40) {
      setStartLocation({ name: 'Central Logistics Hub, New Delhi', coords: [28.6139, 77.209], demand: 0 });
      const generated: LocationNode[] = [];
      const cities = [
        ['North Delhi Warehouse', 28.7041, 77.1025],
        ['Noida Distribution Center', 28.5355, 77.391],
        ['Gurugram Tech Park Hub', 28.4595, 77.0266],
        ['Faridabad Industrial Area', 28.4089, 77.3178],
        ['Ghaziabad Logistics Park', 28.6692, 77.4538],
        ['Greater Noida Cargo Hub', 28.4744, 77.504],
        ['Sonipat Regional Center', 28.9931, 77.0151],
        ['Meerut Transport Depot', 28.9845, 77.7064],
        ['Panipat Textile Hub', 29.3909, 76.9635],
        ['Rohtak Grain Market', 28.8955, 76.6066],
        ['Karnal Highway Junction', 29.6857, 76.9905],
        ['Alwar Commercial Hub', 27.553, 76.6346],
        ['Mathura Crossroads Depot', 27.4924, 77.6737],
        ['Agra Express Gateway', 27.1767, 78.0081],
        ['Bharatpur Logistics Point', 27.2152, 77.503],
        ['Rewari Auto Cluster', 28.1834, 76.6186],
        ['Palwal Freight Corridor', 28.1447, 77.3258],
        ['Bhiwadi Industrial Estate', 28.2104, 76.8606],
        ['Hapur Grain Depot', 28.7306, 77.7759],
        ['Muzaffarnagar Sugar Hub', 29.4727, 77.7085],
      ];
      cities.forEach(([name, lat, lon]) => {
        generated.push({
          name: name as string,
          coords: [lat as number, lon as number],
          demand: Math.floor(Math.random() * 3) + 1,
          window: [9, 17],
        });
      });
      setStops(generated);
    }
  };

  return (
    <aside className="w-80 md:w-96 h-screen flex flex-col bg-[#070a18]/95 border-r border-cyber-border overflow-y-auto p-4 space-y-4 font-sans text-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
        <img src="https://img.icons8.com/color/96/delivery--v1.png" alt="Logo" className="w-8 h-8" />
        <div>
          <h1 className="font-orbitron font-bold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            QUANTUM LOGISTICS
          </h1>
          <p className="text-[10px] text-gray-400 font-roboto">Hybrid QPSO Metaheuristic VRP</p>
        </div>
      </div>

      {/* 1. Location & Stops Management */}
      <div className="glass-panel p-3 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-gray-300 font-orbitron font-semibold">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Search className="w-3.5 h-3.5" /> Stop Dispatch
          </span>
          <span className="text-[11px] text-purple-300">({stops.length} stops)</span>
        </div>

        {/* Start / Hub Selector */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-mono">Central Hub / Start</label>
          <div className="mt-1 flex items-center gap-1.5 p-2 bg-[#050711] border border-cyan-500/30 rounded-lg text-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="truncate">{startLocation?.name || 'Not configured'}</span>
          </div>
        </div>

        {/* Searchbox */}
        <div className="relative">
          <div className="flex gap-1 mb-1.5">
            <button
              onClick={() => setSearchTarget('stop')}
              className={`flex-1 py-1 rounded text-[10px] font-mono border ${
                searchTarget === 'stop' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-gray-700 text-gray-400'
              }`}
            >
              + Destination Stop
            </button>
            <button
              onClick={() => setSearchTarget('start')}
              className={`flex-1 py-1 rounded text-[10px] font-mono border ${
                searchTarget === 'start' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'border-gray-700 text-gray-400'
              }`}
            >
              Change Hub
            </button>
          </div>

          <div className="flex items-center bg-[#050711] border border-cyan-500/30 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-400">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder={`Search ${searchTarget === 'start' ? 'Central Hub' : 'customer stop'}...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent text-gray-200 focus:outline-none text-xs"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#0b1021] border border-cyan-500/40 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectResult(res)}
                  className="p-2 hover:bg-cyan-500/20 cursor-pointer border-b border-gray-800 last:border-0 text-gray-200"
                >
                  <p className="font-semibold truncate text-cyan-300">{res.name.split(',')[0]}</p>
                  <p className="text-[10px] text-gray-400 truncate">{res.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Dataset Buttons */}
        <div className="pt-2 border-t border-gray-800">
          <label className="text-[10px] text-gray-400 uppercase font-mono mb-1 block">Quick Benchmark Presets</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => loadDemoDataset(10)}
              className="p-1.5 bg-gray-900/60 hover:bg-cyan-950/40 border border-gray-700 hover:border-cyan-500/50 rounded text-[11px] text-gray-300 transition-colors"
            >
              📂 10 Nodes (City)
            </button>
            <button
              onClick={() => loadDemoDataset(40)}
              className="p-1.5 bg-gray-900/60 hover:bg-cyan-950/40 border border-gray-700 hover:border-cyan-500/50 rounded text-[11px] text-gray-300 transition-colors"
            >
              📂 40 Nodes (State)
            </button>
          </div>
        </div>

        {/* Stops List */}
        {stops.length > 0 && (
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {stops.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 bg-[#050711]/60 rounded border border-gray-800 text-[11px]"
              >
                <span className="truncate max-w-[180px]">
                  {idx + 1}. {s.name.split(',')[0]}
                  {s.window && <span className="text-purple-400 ml-1">🕒{s.window[0]}-{s.window[1]}h</span>}
                </span>
                <button onClick={() => removeStop(idx)} className="text-red-400 hover:text-red-300 p-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={clearStops}
              className="w-full text-center text-[10px] text-red-400 hover:underline pt-1"
            >
              Clear All Stops
            </button>
          </div>
        )}
      </div>

      {/* 2. Algorithm & Constraints */}
      <div className="glass-panel p-3 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 text-cyan-400 font-orbitron font-semibold">
          <Cpu className="w-3.5 h-3.5" /> Optimization Mode
        </div>

        {/* Algorithm Select */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-mono">Metaheuristic Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full mt-1 bg-[#050711] border border-cyan-500/30 rounded-lg p-2 text-gray-200 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="QPSO">QPSO (Quantum Particle Swarm)</option>
            <option value="Simulated Annealing">Simulated Annealing (with Tunneling)</option>
            <option value="Genetic Algorithm">Genetic Algorithm (Order Crossover OX1)</option>
            <option value="Ant Colony">Ant Colony Optimization (ACO)</option>
            <option value="Classical PSO">Classical Continuous PSO</option>
            <option value="Exact Solver">Exact Branch & Bound (N ≤ 12)</option>
          </select>
        </div>

        {/* Fleet & Capacity */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-mono">Fleet Size ({fleetSize})</label>
            <input
              type="range"
              min="1"
              max="6"
              value={fleetSize}
              onChange={(e) => setFleetSize(parseInt(e.target.value))}
              className="w-full accent-cyan-400 mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-mono">Capacity Limit</label>
            <input
              type="number"
              min="0"
              placeholder="0 = Unlimited"
              value={vehicleCapacity || ''}
              onChange={(e) => setVehicleCapacity(parseInt(e.target.value) || 0)}
              className="w-full mt-1 bg-[#050711] border border-cyan-500/30 rounded p-1.5 text-gray-200 text-xs"
            />
          </div>
        </div>

        {/* Return to Depot Toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-gray-300">Return to Central Hub</span>
          <input
            type="checkbox"
            checked={isRoundTrip}
            onChange={(e) => setIsRoundTrip(e.target.checked)}
            className="accent-cyan-400 w-4 h-4"
          />
        </div>
      </div>

      {/* 3. Traffic Congestion Simulation */}
      <div className="glass-panel p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-orange-400 font-orbitron font-semibold">
            <Clock className="w-3.5 h-3.5" /> Dynamic Traffic θ(t)
          </span>
          <input
            type="checkbox"
            checked={trafficEnabled}
            onChange={(e) => setTrafficEnabled(e.target.checked)}
            className="accent-orange-400 w-4 h-4"
          />
        </div>

        {trafficEnabled && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
              <span>Departure: {trafficHour.toFixed(1)}:00</span>
              <span className={trafficHour >= 8 && trafficHour <= 10 ? 'text-red-400 font-bold' : 'text-cyan-400'}>
                {trafficHour >= 8 && trafficHour <= 10 ? '🔴 Heavy Peak (~1.7x)' : '🟢 Free Flow'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23.5"
              step="0.5"
              value={trafficHour}
              onChange={(e) => setTrafficHour(parseFloat(e.target.value))}
              className="w-full accent-orange-400 mt-1"
            />
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-red-300 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* RUN OPTIMIZER BUTTON */}
      <div className="pt-2">
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className={`w-full py-3 rounded-xl font-orbitron font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 transition-all shadow-neon-cyan ${
            isOptimizing
              ? 'bg-cyan-900/50 text-cyan-300 cursor-not-allowed border border-cyan-500/30'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black'
          }`}
        >
          {isOptimizing ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Optimizing ({liveProgress}%)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>RUN {algorithm} ROUTER</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
