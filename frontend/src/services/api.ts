import axios from 'axios';

export interface LocationNode {
  name: string;
  coords: [number, number]; // [lat, lon]
  demand?: number;
  window?: [number, number];
  service_time?: number;
}

export interface OptimizeRequest {
  start_location: LocationNode;
  stops: LocationNode[];
  algorithm?: string;
  fleet_size?: number;
  num_vehicles?: number;
  vehicle_capacity?: number;
  round_trip?: boolean;
  traffic_enabled?: boolean;
  traffic_hour?: number;
  hazards_enabled?: boolean;
  alpha_weight?: number;
  beta_weight?: number;
  gamma_weight?: number;
  algorithm_params?: Record<string, any>;
  graph_id?: string;
}

export interface BenchmarkRequest {
  start_location: LocationNode;
  stops: LocationNode[];
  algorithms?: string[];
  fleet_size?: number;
  num_vehicles?: number;
  vehicle_capacity?: number;
  traffic_enabled?: boolean;
  traffic_hour?: number;
  round_trip?: boolean;
  trials_per_algo?: number;
  custom_params?: Record<string, any>;
  graph_id?: string;
}

// Clean up baseURL: strip any trailing '/api/v1' or '/api' so all endpoint paths starting with '/api/...' resolve correctly
const rawBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '').replace(/\/+$/, '') || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Graph Loading & Samples
  async loadGraph(placeName: string = 'Delhi, India', nodeCount: number = 20, graphType: string = 'osmnx', trafficHour: number = 9.0) {
    const response = await apiClient.post('/api/graph/load', {
      place_name: placeName,
      node_count: nodeCount,
      graph_type: graphType,
      traffic_hour: trafficHour,
    });
    return response.data;
  },

  async getGraphSamples() {
    const response = await apiClient.get('/api/graph/samples');
    return response.data;
  },

  async getGraphById(graphId: string) {
    const response = await apiClient.get(`/api/graph/${graphId}`);
    return response.data;
  },

  async getTrafficProfile(hour: number = 8.5) {
    const response = await apiClient.get(`/api/graph/traffic-profile?hour=${hour}`);
    return response.data;
  },

  // 2. Route Optimization
  async optimize(data: OptimizeRequest) {
    const response = await apiClient.post('/api/optimize/run', {
      ...data,
      num_vehicles: data.num_vehicles || data.fleet_size || 1,
    });
    return response.data;
  },

  // 3. Benchmarking Suite
  async benchmark(data: BenchmarkRequest) {
    const response = await apiClient.post('/api/benchmark/run', {
      ...data,
      num_vehicles: data.num_vehicles || data.fleet_size || 1,
    });
    return response.data;
  },

  async getBenchmarkById(runId: string) {
    const response = await apiClient.get(`/api/benchmark/${runId}`);
    return response.data;
  },

  async getBenchmarkHistory() {
    const response = await apiClient.get('/api/benchmark/history');
    return response.data;
  },

  getBenchmarkCsvUrl(runId: string) {
    return `${API_BASE}/api/benchmark/export/${runId}`;
  },

  // 4. Large-Scale Scenarios
  async getLargeScaleScenarios() {
    const response = await apiClient.get('/api/v1/benchmark/scenarios');
    return response.data;
  },

  async runLiveScenario(scenario: string = 'peak_hour', nodeLimit: number = 40, fleetSize: number = 4) {
    const response = await apiClient.post('/api/v1/benchmark/scenarios/run', {
      scenario,
      node_limit: nodeLimit,
      fleet_size: fleetSize,
    });
    return response.data;
  },

  // 5. Hazards & Vision Radar
  async getActiveHazards() {
    const response = await apiClient.get('/api/v1/hazards/active');
    return response.data;
  },

  async reportHazard(hazardData: any) {
    const response = await apiClient.post('/api/v1/hazards/report', hazardData);
    return response.data;
  },

  async clearHazards() {
    const response = await apiClient.post('/api/v1/hazards/clear');
    return response.data;
  },

  async detectHazardFromImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/hazards/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;
