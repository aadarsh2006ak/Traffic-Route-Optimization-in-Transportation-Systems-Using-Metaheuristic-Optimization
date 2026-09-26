import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/appStore';
import { Navigation, Download, Layers, ShieldAlert, Zap, Radio, MapPin, Plus, Flag } from 'lucide-react';
import { useOptimize } from '../hooks/useOptimize';

// Custom Map Click Handler component
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Custom SVG Icons for Stops & Depot
const createMarkerIcon = (color: string, label: string, isDepot = false) => {
  return L.divIcon({
    className: 'custom-map-node',
    html: `
      <div style="
        background: ${isDepot ? '#00f0ff' : color};
        color: ${isDepot ? '#040711' : '#ffffff'};
        border: 2px solid rgba(255, 255, 255, 0.95);
        border-radius: 9999px;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 0 14px ${isDepot ? 'rgba(0, 240, 255, 0.8)' : color + '90'}, 0 4px 8px rgba(0,0,0,0.8);
      ">
        ${label}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

// Custom Pulsing Icon for Hazards
const createHazardIcon = (hazardType: string) => {
  let emoji = '⚠️';
  let bgColor = '#ffb700';
  let glowColor = 'rgba(255, 183, 0, 0.6)';

  if (hazardType === 'ACCIDENT') {
    emoji = '💥';
    bgColor = '#ff3b30';
    glowColor = 'rgba(255, 59, 48, 0.7)';
  } else if (hazardType === 'POTHOLE_CLUSTER') {
    emoji = '🕳️';
    bgColor = '#ffb700';
    glowColor = 'rgba(255, 183, 0, 0.6)';
  } else if (hazardType === 'WATERLOGGING') {
    emoji = '🌊';
    bgColor = '#00f0ff';
    glowColor = 'rgba(0, 240, 255, 0.6)';
  } else if (hazardType === 'CONSTRUCTION') {
    emoji = '🚧';
    bgColor = '#eab308';
    glowColor = 'rgba(234, 179, 8, 0.6)';
  }

  return L.divIcon({
    className: 'custom-map-hazard',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        border: 1.5px solid white;
        border-radius: 9999px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 0 14px ${glowColor}, 0 4px 8px rgba(0,0,0,0.8);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to dynamically fit bounds when routes change
const BoundsFitter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [coords, map]);
  return null;
};

export const MapView: React.FC = () => {
  const {
    optimizedResult,
    startLocation,
    setStartLocation,
    stops,
    addStop,
    trafficEnabled,
    trafficHour,
    activeHazards,
    hazardsEnabled,
    removeHazard,
  } = useAppStore();

  const { runOptimization } = useOptimize();
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
  const [mapTheme, setMapTheme] = useState<'voyager' | 'dark' | 'streets' | 'satellite'>('voyager');

  const cartoApiKey = (import.meta as any).env?.VITE_CARTO_API_KEY;
  const cartoParam = cartoApiKey ? `?key=${cartoApiKey}` : '';

  const tileLayers = {
    voyager: {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoParam}`,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    },
    dark: {
      url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoParam}`,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abc',
      maxZoom: 19,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      subdomains: 'abc',
      maxZoom: 18,
    },
  };

  const vehiclePalette = [
    '#00f0ff', // Cyan
    '#00ff9d', // Mint
    '#ffb700', // Amber
    '#bf5af2', // Purple
    '#ff3b30', // Rose
  ];

  // Default center based on depot or first stop
  const center: [number, number] = startLocation
    ? startLocation.coords
    : stops.length > 0
    ? stops[0].coords
    : [28.6139, 77.209];

  // Export CSV Manifest
  const handleDownloadCSV = () => {
    if (!optimizedResult) return;
    const markers = optimizedResult.routes?.markers || optimizedResult.markers || [];
    const rows = [
      ['Vehicle ID', 'Stop Sequence', 'Location Name', 'Latitude', 'Longitude', 'Time Window'],
    ];

    markers.forEach((m: any) => {
      const vId = (m.vehicle_id !== undefined ? m.vehicle_id : (m.vehicle_idx ?? 0)) + 1;
      const sIdx = m.stop_idx ?? m.seq ?? 0;
      const mName = (m.name || '').replace(/"/g, '""');
      const lat = m.coords ? m.coords[0] : '';
      const lng = m.coords ? m.coords[1] : '';
      const win = m.window ? `${m.window[0]}-${m.window[1]}h` : 'Unconstrained';
      rows.push([`Vehicle ${vId}`, sIdx.toString(), `"${mName}"`, lat.toString(), lng.toString(), win]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'quantum_route_manifest.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPeakHour =
    trafficEnabled && ((trafficHour >= 8 && trafficHour <= 10) || (trafficHour >= 17 && trafficHour <= 19.5));

  const hasBlockedHazard = activeHazards.some((h) => h.is_blocked || h.severity >= 0.85);

  return (
    <div className="relative w-full h-full bg-[#040711] overflow-hidden select-none">
      {/* Corner HUD Reticles */}
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Top Map HUD Bar (Non-Colliding Flex Layout) */}
      <div className="absolute top-2 inset-x-2 z-[1000] flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        {/* Left Telemetry Pill */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#060a16]/95 border border-[#1a2f52] px-2.5 py-1 text-[11px] font-mono shadow-xl">
          <span className="flex items-center gap-1.5 text-[#00f0ff] font-bold">
            <Radio className="w-3 h-3 animate-pulse text-[#00f0ff]" />
            <span>ORBITAL RADAR</span>
          </span>

          <span className="text-[#1a2f52]">|</span>

          {trafficEnabled && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-mono ${
                isPeakHour
                  ? 'bg-[#ff3b30]/20 text-[#ff3b30] border border-[#ff3b30]/40'
                  : 'bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40'
              }`}
            >
              {isPeakHour ? '🔴 Peak Surge' : '🟢 Normal Flow'}
            </span>
          )}

          {hazardsEnabled && activeHazards.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#ffb700]/20 text-[#ffb700] border border-[#ffb700]/40 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 text-[#ffb700]" />
              <span>{activeHazards.length} Incidents</span>
            </span>
          )}
        </div>

        {/* Center/Right Map Style Switcher & Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-shrink-0">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-[#060a16]/95 border border-[#1a2f52] p-0.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setMapTheme('voyager')}
              className={`px-2 py-0.5 font-bold transition-all ${
                mapTheme === 'voyager'
                  ? 'bg-[#00f0ff] text-[#040711]'
                  : 'text-[#526685] hover:text-white'
              }`}
            >
              🧭 Voyager Vector
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('dark')}
              className={`px-2 py-0.5 font-bold transition-all ${
                mapTheme === 'dark'
                  ? 'bg-[#00f0ff] text-[#040711]'
                  : 'text-[#526685] hover:text-white'
              }`}
            >
              🌙 Dark HUD
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('streets')}
              className={`px-2 py-0.5 font-bold transition-all ${
                mapTheme === 'streets'
                  ? 'bg-[#00ff9d] text-[#040711]'
                  : 'text-[#526685] hover:text-white'
              }`}
            >
              🗺️ Streets
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('satellite')}
              className={`px-2 py-0.5 font-bold transition-all ${
                mapTheme === 'satellite'
                  ? 'bg-[#ffb700] text-[#040711]'
                  : 'text-[#526685] hover:text-white'
              }`}
            >
              🛰️ Satellite
            </button>
          </div>

          {hasBlockedHazard && (
            <button
              onClick={() => runOptimization()}
              className="flex items-center gap-1 bg-[#ff3b30] hover:bg-[#ff3b30]/80 text-white px-2.5 py-1 text-[11px] font-mono font-bold shadow-lg shadow-[#ff3b30]/30 animate-pulse border border-[#ff3b30]"
              title="Avoid Obstacles & Blockades"
            >
              <Zap className="w-3 h-3 text-[#ffb700]" />
              <span>⚡ Re-Route</span>
            </button>
          )}

          {optimizedResult && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 bg-[#060a16]/95 hover:bg-[#0d182b] text-[#cbd5e1] hover:text-white px-2.5 py-1 text-[11px] font-mono border border-[#1a2f52] transition-all"
            >
              <Download className="w-3 h-3 text-[#00f0ff]" />
              <span>Manifest</span>
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map with High-Contrast Dark Tiles */}
      <MapContainer
        center={center}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0 cursor-crosshair"
        style={{ background: '#060a16' }}
      >
        {/* Click on Map to set Origin or add Stop */}
        <MapClickHandler onMapClick={(lat, lng) => setClickedCoords([lat, lng])} />

        {/* Place zoom controls at bottom-right to avoid any collision */}
        <ZoomControl position="bottomright" />

        {/* Crisp High-Definition Tile Layer */}
        <TileLayer
          key={mapTheme}
          attribution={tileLayers[mapTheme].attribution}
          url={tileLayers[mapTheme].url}
          subdomains={tileLayers[mapTheme].subdomains}
          maxZoom={tileLayers[mapTheme].maxZoom}
        />

        {/* Temporary Interactive Pin for Clicked Coordinate */}
        {clickedCoords && (
          <Marker
            position={clickedCoords}
            icon={L.divIcon({
              className: 'clicked-marker-pin',
              html: `
                <div style="
                  background: #00f0ff;
                  color: #040711;
                  border: 2px solid #ffffff;
                  border-radius: 9999px;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: 900;
                  box-shadow: 0 0 16px #00f0ff;
                  animation: pulse 1s infinite;
                ">
                  +
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup
              position={clickedCoords}
              eventHandlers={{
                remove: () => setClickedCoords(null),
              }}
              autoPan={true}
            >
              <div className="p-2.5 bg-[#060a16] text-white font-mono space-y-2 min-w-[210px]">
                <div className="flex items-center justify-between border-b border-[#1a2f52] pb-1">
                  <span className="text-[11px] font-bold text-[#00f0ff] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>CLICKED LOCATION</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setClickedCoords(null)}
                    className="text-[#526685] hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {clickedCoords[0].toFixed(4)}, {clickedCoords[1].toFixed(4)}
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStartLocation({
                        name: `Origin Depot (${clickedCoords[0].toFixed(3)}, ${clickedCoords[1].toFixed(3)})`,
                        coords: clickedCoords,
                        demand: 0,
                      });
                      setClickedCoords(null);
                    }}
                    className="w-full py-1.5 px-2 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#040711] font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shadow-hud-cyan"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Set as Starting Origin</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addStop({
                        name: `Stop #${stops.length + 1} (${clickedCoords[0].toFixed(3)}, ${clickedCoords[1].toFixed(3)})`,
                        coords: clickedCoords,
                        demand: 2,
                        window: [9, 14],
                      });
                      setClickedCoords(null);
                    }}
                    className="w-full py-1.5 px-2 bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#040711] font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shadow-hud-mint"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add as Delivery Stop</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {optimizedResult?.routes?.coords && optimizedResult.routes.coords.length > 0 && (
          <BoundsFitter coords={optimizedResult.routes.coords} />
        )}

        {/* Polylines for each vehicle */}
        {(optimizedResult?.routes?.routes_geo || optimizedResult?.routes_geometry || []).map((geo, idx) => {
          const color = isPeakHour ? '#ff3b30' : vehiclePalette[idx % vehiclePalette.length];
          return (
            <Polyline
              key={idx}
              positions={geo}
              pathOptions={{
                color: color,
                weight: 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          );
        })}

        {/* Markers for each stop */}
        {optimizedResult ? (
          (optimizedResult.routes?.markers || optimizedResult.markers || []).map((m: any, mIdx: number) => {
            const vId = m.vehicle_id !== undefined ? m.vehicle_id : (m.vehicle_idx ?? 0);
            const color = vehiclePalette[vId % vehiclePalette.length];
            const isDepot = m.stop_idx === 0 || m.seq === 0 || m.type === 'depot';
            const label = isDepot ? '★' : m.is_last ? '🏁' : `${m.stop_idx ?? m.seq ?? mIdx}`;
            const coords = m.coords || [28.6139, 77.209];
            return (
              <Marker
                key={mIdx}
                position={coords}
                icon={createMarkerIcon(color, label, isDepot)}
              >
                <Popup>
                  <div className="p-2 space-y-1 font-mono">
                    <p className="font-bold text-[#00f0ff] text-xs">{m.name || `Stop ${mIdx}`}</p>
                    <p className="text-[11px] text-slate-300">
                      Vehicle #{vId + 1} • Sequence #{m.stop_idx ?? m.seq ?? mIdx}
                    </p>
                    {m.window && (
                      <p className="text-[10px] text-[#ffb700]">
                        🕒 Time Window: {m.window[0]}:00 - {m.window[1]}:00
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          <>
            {/* Setup Mode Markers (Depot + Stops before optimization) */}
            {startLocation && (
              <Marker
                position={startLocation.coords}
                icon={createMarkerIcon('#00f0ff', '★', true)}
              >
                <Popup>
                  <div className="p-2 font-mono">
                    <p className="font-bold text-[#00f0ff] text-xs">{startLocation.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Central Logistics Depot</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {stops.map((stop, idx) => (
              <Marker
                key={idx}
                position={stop.coords}
                icon={createMarkerIcon('#00ff9d', `${idx + 1}`)}
              >
                <Popup>
                  <div className="p-2 font-mono">
                    <p className="font-bold text-[#00ff9d] text-xs">{stop.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Demand: {stop.demand || 1} kg
                      {stop.window ? ` • Window: ${stop.window[0]}-${stop.window[1]}h` : ''}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Hazard Rings and Markers */}
        {hazardsEnabled &&
          activeHazards.map((h) => {
            const hazardColor =
              h.hazard_type === 'ACCIDENT'
                ? '#ff3b30'
                : h.hazard_type === 'WATERLOGGING'
                ? '#00f0ff'
                : '#ffb700';

            return (
              <React.Fragment key={h.hazard_id}>
                <Circle
                  center={h.location}
                  radius={(h.radius_km || 0.6) * 1000}
                  pathOptions={{
                    color: hazardColor,
                    fillColor: hazardColor,
                    fillOpacity: h.is_blocked ? 0.3 : 0.15,
                    weight: 1.5,
                    dashArray: '4,4',
                  }}
                />
                <Marker position={h.location} icon={createHazardIcon(h.hazard_type)}>
                  <Popup>
                    <div className="p-2.5 space-y-1 max-w-xs font-mono">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs" style={{ color: hazardColor }}>
                          {h.title}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 bg-white/10 text-slate-200">
                          {Math.round(h.severity * 100)}% Sev
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">{h.description}</p>
                      <button
                        onClick={() => removeHazard(h.hazard_id)}
                        className="mt-1 text-[9px] text-[#526685] hover:text-white bg-[#060a16] border border-[#1a2f52] px-2 py-0.5 w-full text-center"
                      >
                        Clear Incident
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
      </MapContainer>

      {/* Floating Fleet Legend Overlay on Bottom Left */}
      {optimizedResult && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-[#060a16]/95 border border-[#1a2f52] p-2 text-xs shadow-2xl space-y-1 font-mono">
          <div className="text-[10px] text-[#526685] uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#00f0ff]" />
            <span>Active Fleet</span>
          </div>
          <div className="space-y-0.5">
            {(optimizedResult.routes?.routes_geo || optimizedResult.routes_geometry || []).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: vehiclePalette[i % vehiclePalette.length] }}
                />
                <span className="text-slate-200 font-bold">V0{i + 1}</span>
                <span className="text-[9px] text-[#00ff9d] ml-auto">
                  DISPATCHED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
