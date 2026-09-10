import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/appStore';
import { Navigation, Download, Layers } from 'lucide-react';

// Custom SVG Icons for Leaflet
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
  const { optimizedResult, startLocation, stops, trafficEnabled, trafficHour } = useAppStore();

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

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden glass-panel border border-cyber-border shadow-2xl">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30">
        <Navigation className="w-4 h-4 text-cyber-cyan animate-pulse" />
        <span className="font-orbitron text-xs tracking-wider text-cyber-cyan font-semibold">
          LIVE GEOSPATIAL FLEET RADAR
        </span>
        {trafficEnabled && (
          <span
            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-mono ${
              isPeakHour ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-300'
            }`}
          >
            {isPeakHour ? '🔴 Peak Congestion (1.7x)' : '🟢 Free Flow'}
          </span>
        )}
      </div>

      {/* Download Manifest Button */}
      {optimizedResult && (
        <button
          onClick={handleDownloadCSV}
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-[#bc13fe]/20 hover:bg-[#bc13fe]/40 border border-[#bc13fe]/60 text-purple-200 px-3 py-1.5 rounded-lg text-xs font-orbitron transition-all shadow-lg"
        >
          <Download className="w-3.5 h-3.5" />
          Export Manifest
        </button>
      )}

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
