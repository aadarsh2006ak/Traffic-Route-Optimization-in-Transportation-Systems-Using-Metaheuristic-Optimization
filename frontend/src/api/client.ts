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
  vehicle_capacity?: number;
  round_trip?: boolean;
  traffic_enabled?: boolean;
  traffic_hour?: number;
  mileage_km_per_l?: number;
  fuel_price_per_l?: number;
  algorithm_params?: Record<string, any>;
}

export interface BenchmarkRequest {
  start_location: LocationNode;
  stops: LocationNode[];
  algorithms?: string[];
  fleet_size?: number;
  vehicle_capacity?: number;
  traffic_enabled?: boolean;
  traffic_hour?: number;
  round_trip?: boolean;
  custom_params?: Record<string, any>;
}

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Optimize Route
  async optimize(data: OptimizeRequest) {
    const response = await apiClient.post('/optimize', data);
    return response.data;
  },

  // 2. Run Benchmark Suite
  async benchmark(data: BenchmarkRequest) {
    const response = await apiClient.post('/benchmark', data);
    return response.data;
  },

  // 3. Network Graph
  async buildGraph(nodes: LocationNode[], trafficHour = 9.0) {
    const response = await apiClient.post('/graph/build', {
      nodes,
      traffic_hour: trafficHour,
    });
    return response.data;
  },

  // 4. Nominatim Place Search
  async searchPlaces(query: string) {
    if (!query || query.length < 2) return [];
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'User-Agent': 'QuantumRouteOptimizer_App' } }
      );
      return res.data.map((item: any) => ({
        name: item.display_name,
        coords: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
      }));
    } catch {
      return [];
    }
  },
};

export default apiClient;
