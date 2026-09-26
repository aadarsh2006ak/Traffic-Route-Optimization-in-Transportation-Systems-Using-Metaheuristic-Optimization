import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { api, LocationNode } from '../api/client';
import {
  MapPin,
  Plus,
  Trash2,
  Search,
  Building,
  Sparkles,
  Layers,
  X,
  Clock,
  Package,
  Route,
  ChevronRight,
  ShieldAlert,
  Compass,
  Navigation,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Edit3
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const {
    startLocation,
    setStartLocation,
    stops,
    addStop,
    removeStop,
    clearStops,
    setStops,
    clearAllLocations,
    loadCityPreset
  } = useAppStore();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'origin' | 'destination'>('destination');

  // Manual Add Form States
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTarget, setManualTarget] = useState<'origin' | 'destination'>('destination');
  const [stopName, setStopName] = useState('');
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');
  const [stopDemand, setStopDemand] = useState('2');
  const [timeWindowStart, setTimeWindowStart] = useState('9');
  const [timeWindowEnd, setTimeWindowEnd] = useState('14');

  // Live Geocode Search
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q || q.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await api.searchPlaces(q);
      setSearchResults(results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any, asOrigin = false) => {
    const node: LocationNode = {
      name: item.name.split(',')[0],
      coords: item.coords,
      demand: asOrigin ? 0 : 2,
      window: asOrigin ? undefined : [9, 14],
    };

    if (asOrigin || searchTarget === 'origin') {
      setStartLocation(node);
    } else {
      addStop(node);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName || !stopLat || !stopLng) return;
    const node: LocationNode = {
      name: stopName,
      coords: [parseFloat(stopLat), parseFloat(stopLng)],
      demand: manualTarget === 'origin' ? 0 : (parseInt(stopDemand) || 1),
      window: manualTarget === 'origin' ? undefined : [parseFloat(timeWindowStart) || 9, parseFloat(timeWindowEnd) || 14],
    };

    if (manualTarget === 'origin') {
      setStartLocation(node);
    } else {
      addStop(node);
    }
    setStopName('');
    setStopLat('');
    setStopLng('');
    setShowManualForm(false);
  };

  // Promote a stop to become the starting origin
  const handlePromoteToOrigin = (index: number) => {
    const selected = stops[index];
    const newOrigin: LocationNode = {
      ...selected,
      demand: 0,
      window: undefined,
    };
    // If there was an old origin, put it as a stop
    if (startLocation) {
      const oldAsStop: LocationNode = {
        ...startLocation,
        demand: 2,
        window: [9, 14],
      };
      setStops([oldAsStop, ...stops.filter((_, i) => i !== index)]);
    } else {
      removeStop(index);
    }
    setStartLocation(newOrigin);
  };

  return (
    <aside className="w-full h-full bg-[#040711] border-r border-[#0d182b] flex flex-col justify-between overflow-hidden font-mono select-none">
      {/* 1. Header Bar */}
      <div className="p-3.5 border-b border-[#0d182b] bg-[#060a16] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
            <Route className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-white tracking-wide">
              LOCATIONS & ROUTE BUILDER
            </h2>
            <p className="text-[10px] text-[#526685]">Define Start Location (Origin) & Destinations</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(startLocation || stops.length > 0) && (
            <button
              onClick={clearAllLocations}
              className="px-2 py-0.5 text-[10px] text-[#ff3b30] hover:bg-[#ff3b30]/10 border border-[#ff3b30]/30 transition-all"
              title="Clear all origins and stops"
            >
              CLEAR ALL
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 bg-[#0d182b] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
        {/* Universal Search Bar with Mode Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <Search className="w-3 h-3 text-[#00f0ff]" />
              <span>SEARCH ADDRESS / PLACE</span>
            </span>
            <div className="flex items-center bg-[#060a16] border border-[#0d182b] p-0.5 text-[9px]">
              <button
                type="button"
                onClick={() => setSearchTarget('origin')}
                className={`px-1.5 py-0.5 font-bold transition-all ${
                  searchTarget === 'origin' ? 'bg-[#00f0ff] text-[#040711]' : 'text-[#526685]'
                }`}
              >
                Set as Start
              </button>
              <button
                type="button"
                onClick={() => setSearchTarget('destination')}
                className={`px-1.5 py-0.5 font-bold transition-all ${
                  searchTarget === 'destination' ? 'bg-[#00ff9d] text-[#040711]' : 'text-[#526685]'
                }`}
              >
                + Add Stop
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchTarget === 'origin' ? 'Search starting depot address...' : 'Search delivery stop address (e.g. Noida, Gurgaon)...'}
              className="w-full bg-[#060a16] border border-[#1a2f52] px-3 py-2 text-xs text-white placeholder-[#526685] focus:border-[#00f0ff] focus:outline-none transition-colors"
            />
            {isSearching && (
              <span className="absolute right-2.5 top-2.5 text-[10px] text-[#00f0ff] animate-pulse">
                searching...
              </span>
            )}

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#060a16] border border-[#00f0ff]/50 shadow-2xl z-50 text-xs max-h-52 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border-b border-[#0d182b] last:border-0 hover:bg-[#0d1e3d] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MapPin className="w-3.5 h-3.5 text-[#00f0ff] flex-shrink-0" />
                      <span className="truncate text-white text-[11px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleSelectSearchResult(item, true)}
                        className="px-2 py-0.5 bg-[#00f0ff]/20 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-[#040711] border border-[#00f0ff]/50 text-[10px] font-bold transition-all"
                      >
                        Set Start
                      </button>
                      <button
                        onClick={() => handleSelectSearchResult(item, false)}
                        className="px-2 py-0.5 bg-[#00ff9d]/20 hover:bg-[#00ff9d] text-[#00ff9d] hover:text-[#040711] border border-[#00ff9d]/50 text-[10px] font-bold transition-all"
                      >
                        + Stop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: STARTING LOCATION (ORIGIN / DEPOT) */}
        <div className="space-y-1.5 pt-2 border-t border-[#0d182b]">
          <div className="flex items-center justify-between text-xs font-bold text-[#00f0ff]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-hud-cyan" />
              <span>1. STARTING LOCATION (ORIGIN)</span>
            </span>
            {startLocation && (
              <button
                onClick={() => setStartLocation(null)}
                className="text-[10px] text-[#ff3b30] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {startLocation ? (
            /* Starting Location Card */
            <div className="p-3 bg-[#00f0ff]/5 border border-[#00f0ff]/40 relative space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00f0ff] text-[#040711]">
                  FLEET ORIGIN / DEPOT
                </span>
                <span className="text-[10px] text-[#526685]">
                  {startLocation.coords[0].toFixed(4)}, {startLocation.coords[1].toFixed(4)}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate pt-0.5">
                {startLocation.name}
              </p>
              <p className="text-[10px] text-[#00ff9d]">
                ✓ All vehicles will depart from and return to this point
              </p>
            </div>
          ) : (
            /* Starting Location Empty Prompt */
            <div className="p-3.5 bg-[#060a16] border border-dashed border-[#1a2f52] text-center space-y-2">
              <Building className="w-6 h-6 text-[#526685] mx-auto" />
              <p className="text-xs text-slate-300 font-bold">No Starting Location Set</p>
              <p className="text-[10px] text-[#526685]">
                Search an address above or choose manual entry to set your fleet's starting depot.
              </p>
              <button
                onClick={() => {
                  setManualTarget('origin');
                  setShowManualForm(true);
                }}
                className="px-3 py-1 bg-[#00f0ff]/15 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-[#040711] border border-[#00f0ff]/40 text-xs font-bold transition-all"
              >
                + Set Starting Coordinates
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: DELIVERY DESTINATIONS (STOPS) */}
        <div className="space-y-2 pt-2 border-t border-[#0d182b]">
          <div className="flex items-center justify-between text-xs font-bold text-[#00ff9d]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] shadow-hud-mint" />
              <span>2. DELIVERY DESTINATIONS ({stops.length} STOPS)</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setManualTarget('destination');
                  setShowManualForm(!showManualForm);
                }}
                className="px-2 py-0.5 bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/40 text-[10px] font-bold hover:bg-[#00ff9d] hover:text-[#040711] transition-all"
                title="Manual Stop Entry"
              >
                + Custom Stop
              </button>

              {stops.length > 0 && (
                <button
                  onClick={clearStops}
                  className="p-1 bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/40 hover:bg-[#ff3b30] hover:text-white transition-all"
                  title="Clear all delivery stops"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Manual Stop Entry Modal Form */}
          {showManualForm && (
            <form
              onSubmit={handleManualSubmit}
              className="p-3 bg-[#060a16] border border-[#00f0ff]/40 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-[#00f0ff] pb-1 border-b border-[#0d182b]">
                <span>MANUAL LOCATION ENTRY</span>
                <span className="text-[10px] text-[#ffb700] uppercase">
                  Target: {manualTarget === 'origin' ? 'Starting Point' : 'Delivery Stop'}
                </span>
              </div>

              <input
                type="text"
                placeholder="Location Name (e.g. Warehouse Sector 62)"
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
                className="w-full bg-[#040711] border border-[#1a2f52] px-2.5 py-1.5 text-white"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 28.6129)"
                  value={stopLat}
                  onChange={(e) => setStopLat(e.target.value)}
                  className="w-full bg-[#040711] border border-[#1a2f52] px-2 py-1 text-white font-mono"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 77.2295)"
                  value={stopLng}
                  onChange={(e) => setStopLng(e.target.value)}
                  className="w-full bg-[#040711] border border-[#1a2f52] px-2 py-1 text-white font-mono"
                  required
                />
              </div>

              {manualTarget === 'destination' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Demand (kg)"
                    value={stopDemand}
                    onChange={(e) => setStopDemand(e.target.value)}
                    className="w-full bg-[#040711] border border-[#1a2f52] px-2 py-1 text-white font-mono"
                  />
                  <div className="flex items-center gap-1 text-[10px] text-[#526685]">
                    <input
                      type="number"
                      value={timeWindowStart}
                      onChange={(e) => setTimeWindowStart(e.target.value)}
                      className="w-10 bg-[#040711] border border-[#1a2f52] px-1 py-1 text-center text-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={timeWindowEnd}
                      onChange={(e) => setTimeWindowEnd(e.target.value)}
                      className="w-10 bg-[#040711] border border-[#1a2f52] px-1 py-1 text-center text-white"
                    />
                    <span>h</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-[#00f0ff] text-[#040711] font-bold text-xs"
                >
                  SAVE LOCATION
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 bg-[#0d182b] text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* Destination Stops List */}
          {stops.length === 0 ? (
            <div className="p-4 bg-[#060a16] border border-dashed border-[#1a2f52] text-center space-y-1">
              <MapPin className="w-5 h-5 text-[#526685] mx-auto" />
              <p className="text-xs text-slate-400">No destinations added yet</p>
              <p className="text-[10px] text-[#526685]">Search an address or pick a sample preset below.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
              {stops.map((stop, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#060a16] border border-[#0d182b] hover:border-[#00ff9d]/40 transition-all text-xs flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 bg-[#00ff9d]/20 border border-[#00ff9d]/50 text-[#00ff9d] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white truncate text-[11px]">{stop.name}</p>
                      <p className="text-[10px] text-[#526685]">
                        {stop.demand || 1} kg demand
                        {stop.window ? ` • ${stop.window[0]}:00-${stop.window[1]}:00` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handlePromoteToOrigin(idx)}
                      className="px-1.5 py-0.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-[#040711] border border-[#00f0ff]/30 text-[9px] font-bold transition-all"
                      title="Make this stop the starting origin"
                    >
                      Make Start
                    </button>
                    <button
                      onClick={() => removeStop(idx)}
                      className="p-1 text-[#526685] hover:text-[#ff3b30] transition-colors"
                      title="Remove stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: ROUTE DISPATCH FLOW PREVIEW */}
        {(startLocation || stops.length > 0) && (
          <div className="space-y-1.5 pt-2 border-t border-[#0d182b]">
            <div className="flex items-center justify-between text-xs font-bold text-[#bf5af2]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#bf5af2] shadow-hud-purple" />
                <span>3. ROUTE SEQUENCE FLOW</span>
              </span>
              <span className="text-[10px] text-[#526685]">
                {1 + stops.length} Waypoints
              </span>
            </div>

            <div className="p-2.5 bg-[#060a16] border border-[#1a2f52] space-y-1.5 text-[10.5px]">
              {/* Origin Point */}
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 bg-[#00f0ff] text-[#040711] font-bold text-[9px]">
                  START
                </span>
                <span className={startLocation ? 'text-white font-bold truncate' : 'text-[#ff3b30] italic'}>
                  {startLocation ? startLocation.name : '⚠️ Missing Starting Origin'}
                </span>
              </div>

              {/* Waypoint Stops */}
              {stops.map((s, i) => (
                <div key={i} className="flex items-center gap-2 pl-2 border-l border-[#0d182b]">
                  <span className="text-[#526685]">↓</span>
                  <span className="px-1.5 py-0.2 bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 font-bold text-[9px]">
                    STOP {i + 1}
                  </span>
                  <span className="text-slate-300 truncate">{s.name}</span>
                </div>
              ))}

              {/* End Point */}
              <div className="flex items-center gap-2 pt-0.5 border-t border-[#0d182b]/60">
                <span className="px-1.5 py-0.2 bg-[#ffb700] text-[#040711] font-bold text-[9px]">
                  DESTINATION
                </span>
                <span className="text-[#ffb700] font-bold truncate">
                  {stops.length > 0 ? stops[stops.length - 1].name : (startLocation?.name || 'Awaiting Stops')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Map Tip */}
        <div className="p-2.5 bg-[#00f0ff]/5 border border-dashed border-[#00f0ff]/30 text-[10.5px] text-[#526685] space-y-1">
          <p className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-[#00f0ff]" />
            <span>Interactive Map Placement</span>
          </p>
          <p>
            Click anywhere on the Orbital Map to instantly set a <span className="text-[#00f0ff] font-bold">Start Origin</span> or add a <span className="text-[#00ff9d] font-bold">Delivery Stop</span>.
          </p>
        </div>

        {/* SECTION 4: OPTIONAL SAMPLE DEMO SCENARIOS */}
        <div className="space-y-1.5 pt-2 border-t border-[#0d182b]">
          <span className="text-[10px] font-bold text-[#526685] uppercase tracking-wider">
            Optional Demo Presets (1-Click Load)
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <button
              onClick={() => loadCityPreset('delhi')}
              className="p-1.5 bg-[#060a16] hover:bg-[#00f0ff]/20 hover:text-[#00f0ff] border border-[#1a2f52] text-slate-300 transition-colors text-center"
            >
              Delhi (7)
            </button>
            <button
              onClick={() => loadCityPreset('mumbai')}
              className="p-1.5 bg-[#060a16] hover:bg-[#00ff9d]/20 hover:text-[#00ff9d] border border-[#1a2f52] text-slate-300 transition-colors text-center"
            >
              Mumbai (4)
            </button>
            <button
              onClick={() => loadCityPreset('bengaluru')}
              className="p-1.5 bg-[#060a16] hover:bg-[#ffb700]/20 hover:text-[#ffb700] border border-[#1a2f52] text-slate-300 transition-colors text-center"
            >
              Bengaluru (4)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="p-3 border-t border-[#0d182b] bg-[#060a16] text-[11px] font-mono flex items-center justify-between">
        <span className="text-[#526685]">Route Ready State:</span>
        <span className={startLocation && stops.length > 0 ? 'text-[#00ff9d] font-bold' : 'text-[#ffb700] font-bold'}>
          {startLocation && stops.length > 0 ? 'READY TO SOLVE' : 'AWAITING INPUTS'}
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
