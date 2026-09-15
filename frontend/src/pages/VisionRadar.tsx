import React, { useState } from 'react';
import { useAppStore, HazardItem } from '../store/appStore';
import { api } from '../api/client';
import { useOptimize } from '../hooks/useOptimize';
import {
  ShieldAlert,
  Camera,
  AlertTriangle,
  Zap,
  Trash2,
  CheckCircle2,
  Layers,
  Activity,
  Radio,
  RefreshCw,
  Plus,
  Eye,
} from 'lucide-react';

export const VisionRadar: React.FC = () => {
  const {
    activeHazards,
    setHazards,
    addHazard,
    removeHazard,
    clearHazards,
    hazardsEnabled,
    setHazardsEnabled,
    setActiveTab,
  } = useAppStore();

  const { runOptimization } = useOptimize();

  const [selectedCamera, setSelectedCamera] = useState('CAM_DEL_CP_04');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
  const [isReRouting, setIsReRouting] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('ACCIDENT');
  const [customLat, setCustomLat] = useState('28.6250');
  const [customLng, setCustomLng] = useState('77.2150');
  const [customSeverity, setCustomSeverity] = useState('0.90');

  // Load predefined incident scenario
  const handleLoadPreset = async (presetName: string) => {
    setIsLoadingPreset(true);
    setSelectedPreset(presetName);
    try {
      const res = await api.loadHazardPreset(presetName);
      if (res.active_hazards) {
        setHazards(res.active_hazards);
      }
    } catch (err) {
      console.error('Failed to load preset:', err);
    } finally {
      setIsLoadingPreset(false);
    }
  };

  // Clear all hazards
  const handleClearAll = async () => {
    try {
      await api.clearHazards();
      clearHazards();
    } catch (err) {
      console.error('Failed to clear hazards:', err);
    }
  };

  // Add custom manual/detected incident
  const handleAddCustomHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customLat || !customLng) return;

    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    const sev = parseFloat(customSeverity);

    try {
      const res = await api.reportHazard({
        title: customTitle,
        hazard_type: customType,
        lat,
        lng,
        severity: sev,
        radius_km: sev >= 0.85 ? 0.8 : 0.5,
        is_blocked: sev >= 0.85,
        description: `Manual CV Incident reported at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      });
      if (res.hazard) {
        addHazard(res.hazard);
        setCustomTitle('');
      }
    } catch (err) {
      console.error('Failed to report hazard:', err);
    }
  };

  // Trigger Instant Quantum Re-Route
  const handleTriggerReRoute = async () => {
    setIsReRouting(true);
    await runOptimization();
    setIsReRouting(false);
    setActiveTab('optimizer');
  };

  return (
    <div className="space-y-4 font-sans pb-6">
      {/* Top Vision Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-[#0a1224]/90 via-[#070b16]/95 to-[#160b24]/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
                <Radio className="w-5 h-5 animate-pulse text-red-400" />
              </span>
              <h2 className="text-lg sm:text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-cyan-300">
                CCTV & Computer Vision Hazard Radar
              </h2>
            </div>
            <p className="text-xs text-gray-400 max-w-2xl">
              Real-time neural network inference (YOLOv8) detecting road accidents, severe potholes, and flood zones. Automatically recalculates the graph cost matrix to steer the quantum optimization engine around hazard barriers.
            </p>
          </div>

          {/* Quick Actions / Toggles */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setHazardsEnabled(!hazardsEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron font-semibold transition-all border ${
                hazardsEnabled
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-neon-red'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>CV Obstacle Avoidance: {hazardsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleTriggerReRoute}
              disabled={isReRouting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white text-xs font-orbitron font-bold shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isReRouting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>⚡ Quantum Re-Route Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left (CCTV HUD & Preset Scenarios) / Right (Active Incident List & Manual Ingestion) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: CCTV Scanner HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated CCTV Camera Feed Screen */}
          <div className="glass-panel p-4 rounded-xl border border-gray-800 relative bg-[#070b16]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="font-orbitron text-xs font-bold text-cyan-300">
                  LIVE CCTV NEURAL SCANNER (YOLOv8)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-[10px] font-mono text-red-400 font-semibold tracking-wider">
                  REC • 1080P 30FPS
                </span>
              </div>
            </div>

            {/* Video Feed Simulation Viewport */}
            <div className="mt-3 relative h-56 sm:h-64 rounded-lg overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#050811] border border-cyan-500/30 flex flex-col justify-between p-3">
              {/* Camera Header Overlay */}
              <div className="flex items-center justify-between z-10">
                <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                  CAMERA: {selectedCamera} | LAT: 28.6250 LON: 77.2150
                </div>
                <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                  INFERENCE: 14.2ms
                </div>
              </div>

              {/* Simulated Detection Bounding Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-36 border-2 border-dashed border-red-500 rounded bg-red-500/10 flex flex-col justify-between p-1.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-600 text-white text-[9px] font-orbitron px-1.5 py-0.5 rounded font-bold">
                      ACCIDENT: 95.4%
                    </span>
                    <span className="text-[9px] font-mono text-red-300 bg-black/60 px-1 rounded">
                      BLOCKED
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-300 bg-black/70 px-1 rounded self-start">
                    IMPACT RADIUS: 0.8 KM
                  </div>
                </div>
              </div>

              {/* Camera Footer Overlay */}
              <div className="flex items-center justify-between z-10 pt-2 border-t border-cyan-500/20">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400">
                    CV Tensor Model Online
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                  <span>FRAME: #84920</span>
                </div>
              </div>
            </div>

            {/* Camera Selectors */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {[
                { id: 'CAM_DEL_CP_04', label: 'CP Outer Circle', type: 'ACCIDENT' },
                { id: 'CAM_DEL_S_12', label: 'South Ring Road', type: 'POTHOLES' },
                { id: 'CAM_DEL_MINTO_01', label: 'Minto Underpass', type: 'WATERLOGGED' },
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
                    selectedCamera === cam.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  📹 {cam.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Real-World Incident Presets */}
          <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 bg-[#070b16]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-orbitron text-xs font-bold text-gray-200">
                  TEST INCIDENT PRESET SCENARIOS
                </span>
              </div>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-orbitron text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleLoadPreset('accident_cp')}
                disabled={isLoadingPreset}
                className="p-3 rounded-xl bg-[#0b1220] border border-red-500/40 hover:border-red-400 text-left transition-all hover:bg-red-500/10 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-xs font-bold text-red-400">
                    💥 CP Arterial Collision
                  </span>
                  <span className="text-[10px] font-mono text-red-400/80 bg-red-500/20 px-1.5 py-0.5 rounded">
                    Road Blocked
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Simulates multi-car collision near Central Hub forcing complete quantum detour.
                </p>
              </button>

              <button
                onClick={() => handleLoadPreset('potholes_ring_road')}
                disabled={isLoadingPreset}
                className="p-3 rounded-xl bg-[#0b1220] border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:bg-amber-500/10 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-xs font-bold text-amber-400">
                    🕳️ Ring Road Pothole Surge
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Speed -60%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Asphalt degradation causing deep vehicle speed reduction on arterial routes.
                </p>
              </button>

              <button
                onClick={() => handleLoadPreset('waterlogging_minto')}
                disabled={isLoadingPreset}
                className="p-3 rounded-xl bg-[#0b1220] border border-cyan-500/40 hover:border-cyan-400 text-left transition-all hover:bg-cyan-500/10 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-xs font-bold text-cyan-400">
                    🌊 Minto Bridge Flooding
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                    Delay +85%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Waterlogged underpass causing massive transit impedance.
                </p>
              </button>

              <button
                onClick={() => handleLoadPreset('multi_incident')}
                disabled={isLoadingPreset}
                className="p-3 rounded-xl bg-[#0b1220] border border-purple-500/40 hover:border-purple-400 text-left transition-all hover:bg-purple-500/10 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-xs font-bold text-purple-400">
                    ⚡ Multi-Hazard Network
                  </span>
                  <span className="text-[10px] font-mono text-purple-400/80 bg-purple-500/20 px-1.5 py-0.5 rounded">
                    2+ Hazards
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Simultaneous collision + pothole zones testing multi-vehicle dispatch resilience.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Hazards List & Manual Ingestion (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Hazards Registry */}
          <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 bg-[#070b16]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="font-orbitron text-xs font-bold text-gray-200">
                  ACTIVE ROAD HAZARDS ({activeHazards.length})
                </span>
              </div>
            </div>

            {activeHazards.length === 0 ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-gray-800 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-gray-400">
                  All clear! No road hazards or blocked routes currently active.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeHazards.map((hz) => (
                  <div
                    key={hz.hazard_id}
                    className="p-3 rounded-xl bg-[#0a0f1d] border border-gray-800 hover:border-gray-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              hz.is_blocked ? 'bg-red-500 animate-ping' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span className="text-xs font-bold text-gray-200">{hz.title}</span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          📍 [{hz.location[0].toFixed(4)}, {hz.location[1].toFixed(4)}] • Radius: {hz.radius_km}km
                        </div>
                      </div>
                      <button
                        onClick={() => removeHazard(hz.hazard_id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Dismiss Hazard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Severity Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-400">Severity Impact</span>
                        <span
                          className={
                            hz.severity >= 0.85
                              ? 'text-red-400 font-bold'
                              : 'text-amber-400 font-bold'
                          }
                        >
                          {(hz.severity * 100).toFixed(0)}% ({hz.is_blocked ? 'ROAD BLOCKED' : 'SPEED DELAY'})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            hz.severity >= 0.85
                              ? 'bg-gradient-to-r from-amber-500 to-red-500'
                              : 'bg-gradient-to-r from-cyan-500 to-amber-500'
                          }`}
                          style={{ width: `${hz.severity * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Incident Ingestion Form */}
          <form
            onSubmit={handleAddCustomHazard}
            className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 bg-[#070b16]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span className="font-orbitron text-xs font-bold text-cyan-300">
                REPORT / INJECT NEW INCIDENT
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-mono text-gray-400">Incident Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Tanker Breakdown on Outer Ring"
                  className="w-full px-3 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Hazard Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ACCIDENT">💥 ACCIDENT (Block)</option>
                    <option value="POTHOLE_CLUSTER">🕳️ POTHOLES (Delay)</option>
                    <option value="WATERLOGGING">🌊 WATERLOGGED (Flood)</option>
                    <option value="CONSTRUCTION">🚧 CONSTRUCTION</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Severity (0.1 - 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="1.0"
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron font-semibold transition-all mt-1"
              >
                + Inject Incident into Network
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
