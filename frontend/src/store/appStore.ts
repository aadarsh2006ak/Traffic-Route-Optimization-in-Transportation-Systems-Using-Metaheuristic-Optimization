import { create } from 'zustand';
import { LocationNode } from '../api/client';

export interface RouteMarker {
  coords: [number, number];
  name: string;
  vehicle_id: number;
  stop_idx: number;
  is_last: boolean;
  window?: [number, number];
  type?: string;
}

export interface RouteMetrics {
  distance_km: number;
  duration_min: number;
  fuel_liters: number;
  cost_inr: number;
  vehicles: Array<{
    vehicle_id: number;
    distance_km: number;
    duration_min: number;
    stops_count: number;
    route_path?: string[];
  }>;
  feasibility?: {
    is_feasible: boolean;
    overloaded_vehicles: number;
  };
}

export interface OptimizationStats {
  algorithm: string;
  history: number[];
  beta_history?: number[];
  tunnels: number;
  best_energy?: number;
  iterations: number;
  runtime: number;
}

export interface OptimizationResult {
  metrics?: RouteMetrics;
  routes?: {
    markers: RouteMarker[];
    coords: [number, number][];
    routes_geo: [number, number][][];
  };
  optimization_stats?: OptimizationStats;
  stats?: any;
  vehicles?: any[];
  runtime_sec?: number;
  total_distance_km?: number;
  total_duration_min?: number;
  total_cost?: number;
  routes_geometry?: any[];
  markers?: any[];
  run_id?: string;
  algorithm?: string;
  fleet_size?: number;
}

export interface BenchmarkSummaryItem {
  Algorithm?: string;
  algorithm?: string;
  total_cost?: number;
  distance_km?: number;
  duration_min?: number;
  'Distance (km)'?: number;
  'Duration (min)'?: number;
  'Runtime (s)'?: number;
  runtime_sec?: number;
  Iterations?: number;
  iterations?: number;
  iterations_to_converge?: number;
  'Quantum Tunnels'?: number;
  'Gap from Best (%)'?: string;
  qpso_gap_pct?: string;
  Feasible?: string;
  success_rate?: string;
  stability_std?: number;
  stability_std_dev?: number;
}

export interface HazardItem {
  hazard_id: string;
  title: string;
  hazard_type: 'ACCIDENT' | 'POTHOLE_CLUSTER' | 'WATERLOGGING' | 'CONSTRUCTION' | string;
  location: [number, number];
  severity: number;
  radius_km: number;
  is_blocked: boolean;
  description: string;
  created_at: string;
  confidence: number;
  bbox?: [number, number, number, number];
  camera_id?: string;
}

export interface AppState {
  // Navigation
  activeTab: 'optimizer' | 'dashboard' | 'results' | 'benchmark' | 'graph' | 'vision' | 'history';
  setActiveTab: (tab: 'optimizer' | 'dashboard' | 'results' | 'benchmark' | 'graph' | 'vision' | 'history') => void;

  // Stops & Origin
  startLocation: LocationNode | null;
  setStartLocation: (loc: LocationNode | null) => void;
  stops: LocationNode[];
  addStop: (stop: LocationNode) => void;
  removeStop: (index: number) => void;
  clearStops: () => void;
  setStops: (stops: LocationNode[]) => void;
  clearAllLocations: () => void;
  resetToDefaults: () => void;
  loadCityPreset: (cityKey: string) => void;

  // Solver Configuration
  algorithm: string;
  setAlgorithm: (algo: string) => void;
  fleetSize: number;
  setFleetSize: (size: number) => void;
  vehicleCapacity: number;
  setVehicleCapacity: (cap: number) => void;
  isRoundTrip: boolean;
  setIsRoundTrip: (val: boolean) => void;
  roundTrip: boolean;
  setRoundTrip: (val: boolean) => void;

  // Logistics & Costs
  mileage: number;
  setMileage: (val: number) => void;
  fuelPrice: number;
  setFuelPrice: (val: number) => void;

  // Dynamic Traffic
  trafficEnabled: boolean;
  setTrafficEnabled: (val: boolean) => void;
  trafficHour: number;
  setTrafficHour: (hour: number) => void;
  trafficMultiplier: number;

  // Computer Vision & Road Hazards
  hazardsEnabled: boolean;
  setHazardsEnabled: (val: boolean) => void;
  activeHazards: HazardItem[];
  setHazards: (hazards: HazardItem[]) => void;
  addHazard: (hazard: HazardItem) => void;
  removeHazard: (hazardId: string) => void;
  clearHazards: () => void;
  activeAlert: HazardItem | null;
  setActiveAlert: (alert: HazardItem | null) => void;

  // Hyperparameters
  algorithmParams: Record<string, any>;
  setAlgorithmParams: (params: Record<string, any>) => void;

  // Live Optimization Execution State
  isOptimizing: boolean;
  setIsOptimizing: (val: boolean) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  liveProgress: number; // 0..100
  setLiveProgress: (val: number) => void;
  liveEnergy: number | null;
  setLiveEnergy: (val: number | null) => void;
  liveHistory: number[];
  appendLiveHistory: (val: number) => void;
  clearLiveHistory: () => void;

  // Final Results
  optimizedResult: OptimizationResult | null;
  setOptimizedResult: (res: OptimizationResult | null) => void;

  // Benchmark Results
  benchmarkResults: any;
  setBenchmarkResults: (res: any) => void;
  isBenchmarking: boolean;
  setIsBenchmarking: (val: boolean) => void;
}

export const normalizeOptimizationResult = (res: any): OptimizationResult | null => {
  if (!res) return null;

  const distanceKm = Number(res.metrics?.distance_km ?? res.total_distance_km ?? 0);
  const durationMin = Number(res.metrics?.duration_min ?? res.total_duration_min ?? 0);
  const fuelLiters = Number(res.metrics?.fuel_liters ?? (distanceKm > 0 ? distanceKm / 4.5 : 0));
  const costInr = Number(res.metrics?.cost_inr ?? res.total_cost ?? (distanceKm * 8.0 + (durationMin / 60.0) * 50.0));
  const vehicles = res.metrics?.vehicles ?? res.vehicles ?? [];
  const feasibility = res.metrics?.feasibility ?? res.feasibility ?? { is_feasible: true, overloaded_vehicles: 0 };

  const routesGeo: [number, number][][] = res.routes?.routes_geo ?? res.routes_geometry ?? [];

  const rawMarkers = res.routes?.markers ?? res.markers ?? [];
  const markers: RouteMarker[] = Array.isArray(rawMarkers)
    ? rawMarkers.map((m: any, idx: number) => ({
        coords: m.coords || [28.6139, 77.209],
        name: m.name || `Stop ${idx}`,
        vehicle_id: m.vehicle_id !== undefined ? m.vehicle_id : (m.vehicle_idx ?? 0),
        stop_idx: m.stop_idx ?? m.seq ?? idx,
        is_last: m.is_last ?? (idx === rawMarkers.length - 1),
        window: m.window,
        type: m.type,
      }))
    : [];

  const allCoords: [number, number][] =
    res.routes?.coords ??
    (routesGeo.length > 0 ? routesGeo.flat() : markers.map((m) => m.coords));

  return {
    ...res,
    total_distance_km: distanceKm,
    total_duration_min: durationMin,
    total_cost: costInr,
    vehicles,
    routes_geometry: routesGeo,
    markers,
    metrics: {
      distance_km: distanceKm,
      duration_min: durationMin,
      fuel_liters: fuelLiters,
      cost_inr: costInr,
      vehicles,
      feasibility,
    },
    routes: {
      markers,
      coords: allCoords,
      routes_geo: routesGeo,
    },
  };
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'optimizer',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Start with clean initial state so origin is not forced
  startLocation: null,
  setStartLocation: (loc) => set({ startLocation: loc }),

  stops: [],
  addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] })),
  removeStop: (index) =>
    set((state) => ({ stops: state.stops.filter((_, i) => i !== index) })),
  clearStops: () => set({ stops: [] }),
  setStops: (stops) => set({ stops }),

  clearAllLocations: () =>
    set({
      startLocation: null,
      stops: [],
      optimizedResult: null,
      benchmarkResults: null,
    }),

  resetToDefaults: () =>
    set({
      startLocation: null,
      stops: [],
      fleetSize: 1,
      vehicleCapacity: 0,
      trafficHour: 9.0,
      algorithm: 'QPSO',
      optimizedResult: null,
      benchmarkResults: null,
    }),

  loadCityPreset: (cityKey: string) => {
    if (cityKey === 'mumbai') {
      set({
        startLocation: { name: 'JNPT Port Depot, Mumbai', coords: [18.949, 72.952], demand: 0 },
        stops: [
          { name: 'Bandra Kurla Complex (BKC)', coords: [19.0657, 72.8687], demand: 4, window: [9, 13] },
          { name: 'Andheri East Logistics Park', coords: [19.1136, 72.8697], demand: 3, window: [10, 15] },
          { name: 'Navi Mumbai Vashi Hub', coords: [19.0771, 72.9986], demand: 5, window: [11, 16] },
          { name: 'Thane West Depot', coords: [19.2183, 72.9781], demand: 2, window: [13, 17] },
        ],
      });
    } else if (cityKey === 'bengaluru') {
      set({
        startLocation: { name: 'Whitefield Distribution Terminal', coords: [12.9698, 77.75], demand: 0 },
        stops: [
          { name: 'Electronic City Phase 1', coords: [12.8452, 77.6602], demand: 3, window: [9, 13] },
          { name: 'Koramangala 5th Block', coords: [12.9352, 77.6245], demand: 2, window: [10, 14] },
          { name: 'Indiranagar 100ft Rd', coords: [12.9719, 77.6412], demand: 2, window: [11, 15] },
          { name: 'Manyata Tech Park', coords: [13.045, 77.62], demand: 4, window: [13, 18] },
        ],
      });
    } else if (cityKey === 'connaught') {
      set({
        startLocation: { name: 'Connaught Place Radial Origin', coords: [28.6315, 77.2167], demand: 0 },
        stops: [
          { name: 'Barakhamba Road', coords: [28.6292, 77.2274], demand: 2, window: [9, 12] },
          { name: 'Janpath Lane', coords: [28.6231, 77.2184], demand: 1, window: [10, 13] },
          { name: 'Kasturba Gandhi Marg', coords: [28.6205, 77.2238], demand: 2, window: [11, 14] },
          { name: 'Parliament Street', coords: [28.6249, 77.2128], demand: 3, window: [12, 15] },
        ],
      });
    } else {
      // Delhi NCR Sample
      set({
        startLocation: { name: 'Central Logistics Hub, Connaught Place', coords: [28.6315, 77.2167], demand: 0 },
        stops: [
          { name: 'India Gate, New Delhi', coords: [28.6129, 77.2295], demand: 2, window: [9, 12] },
          { name: 'Red Fort, Old Delhi', coords: [28.6562, 77.241], demand: 3, window: [10, 14] },
          { name: 'Lotus Temple, Kalkaji', coords: [28.5535, 77.2588], demand: 2, window: [11, 15] },
          { name: 'Qutub Minar, Mehrauli', coords: [28.5244, 77.1855], demand: 4, window: [12, 16] },
          { name: 'Akshardham, East Delhi', coords: [28.6127, 77.2773], demand: 1, window: [9, 13] },
          { name: 'Cyber Hub, Gurugram', coords: [28.495, 77.0895], demand: 3, window: [14, 18] },
          { name: 'Noida Sector 62', coords: [28.627, 77.373], demand: 2, window: [10, 15] },
        ],
      });
    }
  },

  algorithm: 'QPSO',
  setAlgorithm: (algo) => set({ algorithm: algo }),
  fleetSize: 1,
  setFleetSize: (size) => set({ fleetSize: size }),
  vehicleCapacity: 0,
  setVehicleCapacity: (cap) => set({ vehicleCapacity: cap }),
  isRoundTrip: false,
  setIsRoundTrip: (val) => set({ isRoundTrip: val, roundTrip: val }),
  roundTrip: false,
  setRoundTrip: (val) => set({ roundTrip: val, isRoundTrip: val }),

  mileage: 12.0,
  setMileage: (val) => set({ mileage: val }),
  fuelPrice: 96.0,
  setFuelPrice: (val) => set({ fuelPrice: val }),

  trafficEnabled: true,
  setTrafficEnabled: (val) => set({ trafficEnabled: val }),
  trafficHour: 9.0,
  setTrafficHour: (hour) => {
    const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19.5);
    set({
      trafficHour: hour,
      trafficMultiplier: isPeak ? 1.6 : 1.0,
    });
  },
  trafficMultiplier: 1.6,

  // CV Hazards Initial State
  hazardsEnabled: true,
  setHazardsEnabled: (val) => set({ hazardsEnabled: val }),
  activeHazards: [],
  setHazards: (hazards) => set({ activeHazards: hazards }),
  addHazard: (hazard) =>
    set((state) => ({ activeHazards: [hazard, ...state.activeHazards] })),
  removeHazard: (hazardId) =>
    set((state) => ({
      activeHazards: state.activeHazards.filter((h) => h.hazard_id !== hazardId),
    })),
  clearHazards: () => set({ activeHazards: [] }),
  activeAlert: null,
  setActiveAlert: (alert) => set({ activeAlert: alert }),

  algorithmParams: { swarm_size: 50, beta: 1.2, max_iter: 600 },
  setAlgorithmParams: (params) => set({ algorithmParams: params }),

  isOptimizing: false,
  setIsOptimizing: (val) => set({ isOptimizing: val, isLoading: val }),
  isLoading: false,
  setIsLoading: (val) => set({ isLoading: val, isOptimizing: val }),
  liveProgress: 0,
  setLiveProgress: (val) => set({ liveProgress: val }),
  liveEnergy: null,
  setLiveEnergy: (val) => set({ liveEnergy: val }),
  liveHistory: [],
  appendLiveHistory: (val) =>
    set((state) => ({ liveHistory: [...state.liveHistory, val] })),
  clearLiveHistory: () => set({ liveHistory: [] }),

  optimizedResult: null,
  setOptimizedResult: (res) => set({ optimizedResult: normalizeOptimizationResult(res) }),

  benchmarkResults: null,
  setBenchmarkResults: (res) => set({ benchmarkResults: res }),
  isBenchmarking: false,
  setIsBenchmarking: (val) => set({ isBenchmarking: val }),
}));
