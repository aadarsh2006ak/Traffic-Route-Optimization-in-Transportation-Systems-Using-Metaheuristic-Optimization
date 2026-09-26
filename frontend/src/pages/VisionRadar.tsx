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
  Sparkles,
  MapPin,
  Sliders
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
        description: `CV telemetry incident reported at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
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
    <div className="space-y-4 pb-6">
      {/* Top Vision Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-base sm:text-lg font-syne font-bold text-white flex items-center gap-2">
                <span>Computer Vision Road Hazard Radar (YOLOv8)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CV Radar
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Neural network inference detecting road collisions, surface craters, and flash waterlogging. Automatically inflates graph edge weights to steer quantum particles around blocked corridors.
            </p>
          </div>

          {/* Quick Actions / Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setHazardsEnabled(!hazardsEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-syne font-semibold transition-all border ${
                hazardsEnabled
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-hazard-glow'
                  : 'bg-white/[0.05] border-white/[0.08] text-slate-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Obstacle Avoidance: {hazardsEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={handleTriggerReRoute}
              disabled={isReRouting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-syne font-bold shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
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

      {/* Grid: Left (CCTV HUD & Presets) / Right (Incident List & Reporter) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: CCTV Scanner HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated CCTV Camera Feed Screen */}
          <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="font-syne text-xs font-bold text-white">
                  LIVE CCTV NEURAL SCANNER (YOLOv8)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  REC • 1080P 30FPS
                </span>
              </div>
            </div>

            {/* Video Feed Simulation Viewport */}
            <div className="relative h-60 sm:h-64 rounded-xl overflow-hidden bg-[#07090e] border border-white/[0.08] flex flex-col justify-between p-3.5">
              {/* Camera Header Overlay */}
              <div className="flex items-center justify-between z-10">
                <div className="bg-[#090d16]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300 border border-white/[0.08]">
                  CAMERA: {selectedCamera} | LAT: 28.6250 LON: 77.2150
                </div>
                <div className="bg-[#090d16]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-solar-400 border border-white/[0.08]">
                  INFERENCE: 14.2ms
                </div>
              </div>

              {/* Simulated Detection Bounding Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-40 border-2 border-dashed border-rose-500 rounded-xl bg-rose-500/10 flex flex-col justify-between p-2 animate-pulse">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-600 text-white text-[9px] font-syne px-2 py-0.5 rounded font-bold">
                      ACCIDENT: 95.4%
                    </span>
                    <span className="text-[9px] font-mono text-rose-300 bg-black/60 px-1.5 py-0.5 rounded">
                      BLOCKED
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-300 bg-black/70 px-1.5 py-0.5 rounded self-start">
                    ZONE: CONNAUGHT PL. OUTER CIRCLE
                  </div>
                </div>
              </div>

              {/* Camera Controls Footer */}
              <div className="flex items-center justify-between z-10 text-[10px] font-mono text-slate-400">
                <span>FPS: 29.97 • BITRATE: 4.8 Mbps</span>
                <span>MODEL: YOLOv8x-Custom-RoadNet</span>
              </div>
            </div>

            {/* Preset Incident Simulations */}
            <div className="space-y-2 pt-2">
              <span className="font-syne text-xs font-semibold text-slate-300">
                Load Incident Simulation Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => handleLoadPreset('accident_cp')}
                  disabled={isLoadingPreset}
                  className="p-2.5 rounded-xl bg-[#090d16] hover:bg-rose-500/20 hover:text-rose-300 border border-white/[0.06] text-left transition-colors font-syne font-medium"
                >
                  <div className="text-rose-400 font-bold text-[11px]">💥 Major Crash</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Connaught Place</div>
                </button>

                <button
                  onClick={() => handleLoadPreset('potholes_ring_road')}
                  disabled={isLoadingPreset}
                  className="p-2.5 rounded-xl bg-[#090d16] hover:bg-solar-500/20 hover:text-solar-300 border border-white/[0.06] text-left transition-colors font-syne font-medium"
                >
                  <div className="text-solar-400 font-bold text-[11px]">🕳️ Pothole Zone</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ring Road South</div>
                </button>

                <button
                  onClick={() => handleLoadPreset('waterlogging_minto')}
                  disabled={isLoadingPreset}
                  className="p-2.5 rounded-xl bg-[#090d16] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.06] text-left transition-colors font-syne font-medium"
                >
                  <div className="text-cyan-400 font-bold text-[11px]">🌊 Flooded Pass</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Minto Road</div>
                </button>

                <button
                  onClick={() => handleLoadPreset('multi_incident')}
                  disabled={isLoadingPreset}
                  className="p-2.5 rounded-xl bg-[#090d16] hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/[0.06] text-left transition-colors font-syne font-medium"
                >
                  <div className="text-indigo-400 font-bold text-[11px]">⚡ Multi-Zone</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Crash + Craters</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Incident List & Manual Ingestion (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Incident List */}
          <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-solar-400" />
                <h3 className="font-syne font-bold text-xs text-white uppercase tracking-wider">
                  Active Hazard Telemetry ({activeHazards.length})
                </h3>
              </div>
              {activeHazards.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-syne text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {activeHazards.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  ✅ No active incidents detected on road corridors.
                </div>
              ) : (
                activeHazards.map((h) => (
                  <div
                    key={h.hazard_id}
                    className="p-3 rounded-xl bg-[#090d16]/80 border border-white/[0.06] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-syne font-bold text-slate-200">{h.title}</span>
                      <button
                        onClick={() => removeHazard(h.hazard_id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{h.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-500">
                      <span>Sev: {Math.round(h.severity * 100)}%</span>
                      <span className={h.is_blocked ? 'text-rose-400 font-bold' : 'text-solar-400'}>
                        {h.is_blocked ? '⛔ FULL BLOCKADE' : '⚠️ SPEED RESTRICTION'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Manual Incident Ingestion */}
          <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-3">
            <h3 className="font-syne font-bold text-xs text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Manual Hazard Telemetry Ingestion
            </h3>

            <form onSubmit={handleAddCustomHazard} className="space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Incident Title (e.g. Tanker Breakdown)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#090d16] border border-white/[0.08] rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 text-xs"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="bg-[#090d16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                >
                  <option value="ACCIDENT">ACCIDENT</option>
                  <option value="POTHOLE_CLUSTER">POTHOLE CLUSTER</option>
                  <option value="WATERLOGGING">WATERLOGGING</option>
                  <option value="CONSTRUCTION">CONSTRUCTION</option>
                </select>

                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  placeholder="Severity (0.1 - 1.0)"
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value)}
                  className="bg-[#090d16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="bg-[#090d16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="bg-[#090d16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-syne font-bold text-xs transition-colors"
              >
                Register Road Incident
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionRadar;
