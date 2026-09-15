import { create } from 'zustand';
import { LocationNode } from '../api/client';

export interface RouteMarker {
  coords: [number, number];
  name: string;
  vehicle_id: number;
  stop_idx: number;
  is_last: boolean;
  window?: [number, number];
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
  metrics: RouteMetrics;
  routes: {
    markers: RouteMarker[];
    coords: [number, number][];
    routes_geo: [number, number][][];
  };
  optimization_stats: OptimizationStats;
}

export interface BenchmarkSummaryItem {
  Algorithm: string;
  'Distance (km)': number;
  'Duration (min)': number;
  'Runtime (s)': number;
  Iterations: number;
  'Quantum Tunnels': number;
  'Gap from Best (%)': string;
  Feasible: string;
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
  activeTab: 'optimizer' | 'benchmark' | 'graph' | 'vision' | 'history';
  setActiveTab: (tab: 'optimizer' | 'benchmark' | 'graph' | 'vision' | 'history') => void;

  // Stops & Depot
  startLocation: LocationNode | null;
  setStartLocation: (loc: LocationNode | null) => void;
  stops: LocationNode[];
  addStop: (stop: LocationNode) => void;
  removeStop: (index: number) => void;
  clearStops: () => void;
  setStops: (stops: LocationNode[]) => void;

  // Solver Configuration
  algorithm: string;
  setAlgorithm: (algo: string) => void;
  fleetSize: number;
  setFleetSize: (size: number) => void;
  vehicleCapacity: number;
  setVehicleCapacity: (cap: number) => void;
  isRoundTrip: boolean;
  setIsRoundTrip: (val: boolean) => void;

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
  benchmarkResults: {
    summary: BenchmarkSummaryItem[];
    convergence: Record<string, number[]>;
    runtimes: Array<{ Algorithm: string; 'Runtime (s)': number }>;
  } | null;
  setBenchmarkResults: (res: any) => void;
  isBenchmarking: boolean;
  setIsBenchmarking: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'optimizer',
  setActiveTab: (tab) => set({ activeTab: tab }),

  startLocation: {
    name: 'Central Logistics Hub, New Delhi',
    coords: [28.6139, 77.209],
    demand: 0,
  },
  setStartLocation: (loc) => set({ startLocation: loc }),

  stops: [
    { name: 'India Gate, New Delhi', coords: [28.6129, 77.2295], demand: 2, window: [9, 13] },
    { name: 'Red Fort, Delhi', coords: [28.6562, 77.241], demand: 1, window: [10, 14] },
    { name: 'Lotus Temple, New Delhi', coords: [28.5535, 77.2588], demand: 3, window: [11, 15] },
    { name: 'Qutub Minar, New Delhi', coords: [28.5244, 77.1855], demand: 2, window: [12, 16] },
    { name: 'Akshardham Temple, Delhi', coords: [28.6127, 77.2773], demand: 1, window: [9, 13] },
  ],
  addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] })),
  removeStop: (index) =>
    set((state) => ({ stops: state.stops.filter((_, i) => i !== index) })),
  clearStops: () => set({ stops: [] }),
  setStops: (stops) => set({ stops }),

  algorithm: 'QPSO',
  setAlgorithm: (algo) => set({ algorithm: algo }),
  fleetSize: 1,
  setFleetSize: (size) => set({ fleetSize: size }),
  vehicleCapacity: 0,
  setVehicleCapacity: (cap) => set({ vehicleCapacity: cap }),
  isRoundTrip: false,
  setIsRoundTrip: (val) => set({ isRoundTrip: val }),

  mileage: 12.0,
  setMileage: (val) => set({ mileage: val }),
  fuelPrice: 96.0,
  setFuelPrice: (val) => set({ fuelPrice: val }),

  trafficEnabled: true,
  setTrafficEnabled: (val) => set({ trafficEnabled: val }),
  trafficHour: 9.0,
  setTrafficHour: (hour) => set({ trafficHour: hour }),

  // CV Hazards Initial State
  hazardsEnabled: true,
  setHazardsEnabled: (val) => set({ hazardsEnabled: val }),
  activeHazards: [
    {
      hazard_id: 'hz_demo_accident',
      title: '💥 Major Collision at Connaught Place',
      hazard_type: 'ACCIDENT',
      location: [28.625, 77.215],
      severity: 0.95,
      radius_km: 0.8,
      is_blocked: true,
      description: '2-lane road blockage reported by CCTV Camera #14. High congestion.',
      created_at: new Date().toISOString(),
      confidence: 0.94,
      bbox: [120, 85, 340, 260],
      camera_id: 'CAM_DEL_CP_04',
    },
    {
      hazard_id: 'hz_demo_pothole',
      title: '🕳️ Pothole Zone on South Corridor',
      hazard_type: 'POTHOLE_CLUSTER',
      location: [28.58, 77.23],
      severity: 0.55,
      radius_km: 0.5,
      is_blocked: false,
      description: 'Deep asphalt fractures causing vehicle speed drop to <15 km/h.',
      created_at: new Date().toISOString(),
      confidence: 0.88,
      bbox: [210, 160, 180, 110],
      camera_id: 'CAM_DEL_S_12',
    },
  ],
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
  setIsOptimizing: (val) => set({ isOptimizing: val }),
  liveProgress: 0,
  setLiveProgress: (val) => set({ liveProgress: val }),
  liveEnergy: null,
  setLiveEnergy: (val) => set({ liveEnergy: val }),
  liveHistory: [],
  appendLiveHistory: (val) =>
    set((state) => ({ liveHistory: [...state.liveHistory, val] })),
  clearLiveHistory: () => set({ liveHistory: [] }),

  optimizedResult: null,
  setOptimizedResult: (res) => set({ optimizedResult: res }),

  benchmarkResults: null,
  setBenchmarkResults: (res) => set({ benchmarkResults: res }),
  isBenchmarking: false,
  setIsBenchmarking: (val) => set({ isBenchmarking: val }),
}));

