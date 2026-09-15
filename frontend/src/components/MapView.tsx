import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/appStore';
import { Navigation, Download, Layers, ShieldAlert, AlertTriangle, Zap } from 'lucide-react';
import { useOptimize } from '../hooks/useOptimize';

// Custom SVG Icons for Stops & Depot
const createIcon = (color: string, label: string, isDepot = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${isDepot ? '#00e676' : color};
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: bold;
        box-shadow: 0 0 12px ${color};
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Custom Pulsing Icon for Hazards (Accidents, Potholes, Floods)
const createHazardIcon = (hazardType: string, isBlocked: boolean) => {
  let iconEmoji = '⚠️';
  let bgColor = '#ff9100';
  let glowColor = 'rgba(255, 145, 0, 0.7)';

  if (hazardType === 'ACCIDENT') {
    iconEmoji = '💥';
    bgColor = '#ff2b2b';
    glowColor = 'rgba(255, 43, 43, 0.85)';
  } else if (hazardType === 'POTHOLE_CLUSTER') {
    iconEmoji = '🕳️';
    bgColor = '#ff9100';
    glowColor = 'rgba(255, 145, 0, 0.7)';
  } else if (hazardType === 'WATERLOGGING') {
    iconEmoji = '🌊';
    bgColor = '#00f3ff';
    glowColor = 'rgba(0, 243, 255, 0.7)';
  } else if (hazardType === 'CONSTRUCTION') {
    iconEmoji = '🚧';
    bgColor = '#ffd600';
    glowColor = 'rgba(255, 214, 0, 0.7)';
  }

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 0 16px ${glowColor};
        animation: pulse 1.5s infinite;
      ">
        ${iconEmoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to dynamically fit bounds when routes change
const BoundsFitter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
};

export const MapView: React.FC = () => {
  const {
    optimizedResult,
    startLocation,
    stops,
    trafficEnabled,
    trafficHour,
    activeHazards,
    hazardsEnabled,
    removeHazard,
  } = useAppStore();

  const { runOptimization } = useOptimize();

  const vehicleColors = ['#00f3ff', '#ff9100', '#bc13fe', '#00e676', '#ff2b2b'];

  // Calculate default center
  const center: [number, number] = startLocation
    ? startLocation.coords
    : stops.length > 0
    ? stops[0].coords
    : [28.6139, 77.209];

  // Export CSV Manifest
  const handleDownloadCSV = () => {
    if (!optimizedResult) return;
    const rows = [
      ['Vehicle ID', 'Stop Sequence', 'Location Name', 'Latitude', 'Longitude', 'Time Window'],
    ];

    optimizedResult.routes.markers.forEach((m) => {
      rows.push([
        `Vehicle ${m.vehicle_id + 1}`,
        m.stop_idx.toString(),
        `"${m.name.replace(/"/g, '""')}"`,
        m.coords[0].toString(),
        m.coords[1].toString(),
        m.window ? `${m.window[0]}-${m.window[1]}h` : 'Unconstrained',
      ]);
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
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] lg:h-[600px] rounded-xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl">
      {/* Top Map Controls HUD */}
      <div className="absolute top-2.5 inset-x-2.5 z-[1000] flex items-center justify-between pointer-events-none gap-2">
        {/* Top Map HUD Bar */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-[#0a0f1d]/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-cyan-500/30 shadow-md">
          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse flex-shrink-0" />
          <span className="font-orbitron text-[10px] sm:text-xs tracking-wider text-cyan-400 font-semibold truncate max-w-[140px] sm:max-w-none">
            FLEET RADAR
          </span>
          {trafficEnabled && (
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono whitespace-nowrap ${
                isPeakHour ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-300'
              }`}
            >
              {isPeakHour ? '🔴 Peak' : '🟢 Free'}
            </span>
          )}

          {hazardsEnabled && activeHazards.length > 0 && (
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>{activeHazards.length} CV Hazards</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {hasBlockedHazard && (
            <button
              onClick={() => runOptimization()}
              className="flex items-center gap-1 sm:gap-1.5 bg-red-600/80 hover:bg-red-500 border border-red-400 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-orbitron transition-all shadow-lg animate-pulse"
              title="Avoid Active Hazard Zones with QPSO"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ Quantum Re-Route</span>
            </button>
          )}

          {optimizedResult && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#bc13fe]/30 hover:bg-[#bc13fe]/50 border border-[#bc13fe]/60 text-purple-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-orbitron transition-all shadow-lg whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span> Manifest
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map with Clean Dark OpenStreetMap Tiles */}
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: '#050711' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />

        {optimizedResult && <BoundsFitter coords={optimizedResult.routes.coords} />}

        {/* Polylines for each vehicle */}
        {optimizedResult?.routes.routes_geo.map((geo, idx) => {
          const color = isPeakHour ? '#ff2b2b' : vehicleColors[idx % vehicleColors.length];
          return (
            <Polyline
              key={idx}
              positions={geo}
              pathOptions={{
                color: color,
                weight: 4.5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          );
        })}

        {/* Markers for each stop */}
        {optimizedResult ? (
          optimizedResult.routes.markers.map((m, mIdx) => {
            const color = vehicleColors[m.vehicle_id % vehicleColors.length];
            const isDepot = m.stop_idx === 0;
            const label = isDepot ? '🏢' : m.is_last ? '🏁' : `${m.stop_idx}`;
            return (
              <Marker
                key={mIdx}
                position={m.coords}
                icon={createIcon(color, label, isDepot)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="bg-[#0b1021] text-gray-100 p-2 rounded text-xs font-sans">
                    <p className="font-bold text-cyan-400 font-orbitron">{m.name}</p>
                    <p className="text-gray-300 mt-1">Vehicle #{m.vehicle_id + 1} • Stop #{m.stop_idx}</p>
                    {m.window && (
                      <p className="text-purple-300 mt-0.5">🕒 Window: {m.window[0]}:00 - {m.window[1]}:00</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          <>
            {startLocation && (
              <Marker position={startLocation.coords} icon={createIcon('#00e676', '🏢', true)}>
                <Popup>{startLocation.name} (Central Hub)</Popup>
              </Marker>
            )}
            {stops.map((s, idx) => (
              <Marker key={idx} position={s.coords} icon={createIcon('#00f3ff', `${idx + 1}`)}>
                <Popup>{s.name}</Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Active Computer Vision Hazard Markers & Impact Circles */}
        {hazardsEnabled &&
          activeHazards.map((hz) => {
            const circleColor = hz.hazard_type === 'ACCIDENT' ? '#ff2b2b' : hz.hazard_type === 'WATERLOGGING' ? '#00f3ff' : '#ff9100';
            return (
              <React.Fragment key={hz.hazard_id}>
                {/* Visual Impact Radius */}
                <Circle
                  center={hz.location}
                  radius={hz.radius_km * 1000}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: 0.18,
                    weight: 1.5,
                    dashArray: hz.is_blocked ? '4, 4' : undefined,
                  }}
                />

                {/* Hazard Marker Pin */}
                <Marker
                  position={hz.location}
                  icon={createHazardIcon(hz.hazard_type, hz.is_blocked)}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="bg-[#0b1021] text-gray-100 p-2.5 rounded text-xs font-sans space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400 font-orbitron">{hz.title}</span>
                        <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">
                          {hz.is_blocked ? 'BLOCKED' : 'DELAY'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300">{hz.description}</p>
                      <div className="text-[10px] font-mono text-gray-400 border-t border-gray-800 pt-1">
                        Severity: {(hz.severity * 100).toFixed(0)}% • Radius: {hz.radius_km}km
                      </div>
                      <button
                        onClick={() => removeHazard(hz.hazard_id)}
                        className="w-full py-1 text-[10px] font-orbitron bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded transition-all mt-1"
                      >
                        Dismiss / Mark Resolved
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
      </MapContainer>

      {/* Floating Fleet Legend Overlay */}
      {optimizedResult && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#0a0f1d]/90 backdrop-blur-md p-3 rounded-lg border border-cyan-500/20 text-xs">
          <div className="font-orbitron text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Active Fleet Dispatch
          </div>
          <div className="space-y-1.5">
            {optimizedResult.routes.routes_geo.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: vehicleColors[i % vehicleColors.length] }}
                />
                <span className="text-gray-200 font-mono">Vehicle {i + 1}</span>
                <span className="text-[10px] text-cyan-400 ml-auto border border-cyan-500/30 px-1.5 py-0.2 rounded">
                  ONLINE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

