# Backend REST & WebSocket API Reference

**Smart India Hackathon 2026** | **Problem Statement ID: 26137**
**Organization:** Egreen Quanta | **Theme:** Transportation & Logistics

---

## Base URLs
- **Local Dev:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 1. Road Network Graph Endpoints

### `POST /api/graph/load`
Loads a road network graph via OSMnx place name or generates a synthetic test network.

**Request Body:**
```json
{
  "place_name": "Delhi, India",
  "graph_type": "osmnx",
  "node_count": 25,
  "traffic_hour": 9.0
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "graph_id": "graph_a1b2c3d4",
  "name": "Delhi, India (25 nodes)",
  "node_count": 25,
  "edge_count": 550,
  "analytics": {
    "num_nodes": 25,
    "num_edges": 550,
    "graph_density": 0.9167,
    "avg_clustering_coeff": 0.884,
    "degree_centrality": { ... },
    "betweenness_centrality": { ... }
  },
  "nodes": [ ... ]
}
```

### `GET /api/graph/samples`
Fetches preset real cities (Delhi, Mumbai, Bengaluru, Pune) and synthetic benchmark scales (10, 20, 50, 100, 500 nodes).

### `GET /api/graph/{graph_id}`
Retrieves stored graph nodes, distance matrices, and topological properties.

### `GET /api/graph/traffic-profile?hour=8.5`
Retrieves time-dependent congestion multiplier $\theta(t)$ and 24-hour Gaussian traffic distribution.

---

## 2. Optimization Engine Endpoints

### `POST /api/optimize/run`
Triggers vehicle routing optimization using Quantum-Behaved PSO (QPSO) or comparison algorithms.

**Request Body:**
```json
{
  "start_location": {
    "name": "Central Depot HQ",
    "coords": [28.6139, 77.2090]
  },
  "stops": [
    {"name": "Stop A", "coords": [28.6315, 77.2167], "demand": 2.5, "window": [9.0, 12.0]},
    {"name": "Stop B", "coords": [28.6517, 77.1906], "demand": 1.8, "window": [10.0, 14.0]}
  ],
  "algorithm": "QPSO",
  "num_vehicles": 2,
  "vehicle_capacity": 15,
  "traffic_enabled": true,
  "traffic_hour": 9.0,
  "alpha_weight": 0.4,
  "beta_weight": 0.4,
  "gamma_weight": 0.2
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "run_id": "opt_9f8e7d6c",
  "algorithm": "QPSO",
  "fleet_size": 2,
  "total_distance_km": 42.8,
  "total_duration_min": 64.5,
  "total_cost": 384.2,
  "runtime_sec": 0.115,
  "stats": {
    "algorithm": "QPSO",
    "iterations": 500,
    "tunnels": 42,
    "best_energy": 384.2,
    "history": [ 820.0, ..., 384.2 ]
  },
  "routes_geometry": [ ... ],
  "vehicles": [ ... ],
  "markers": [ ... ]
}
```

---

## 3. Real-Time WebSocket Streaming

### `WS /ws/optimize/{run_id}`
Streams live iteration-by-iteration energy minimization and quantum wave collapse steps.

**Client Send:**
```json
{
  "start_location": { "name": "Depot", "coords": [28.6139, 77.2090] },
  "stops": [ ... ],
  "algorithm": "QPSO",
  "num_vehicles": 2
}
```

**Server Stream Messages:**
```json
{"type": "start", "message": "Starting QPSO optimization engine...", "nodes_count": 21}
{"type": "progress", "iteration": 50, "total_iterations": 500, "current_energy": 520.4, "beta": 0.95, "tunnels": 8, "progress_pct": 10.0}
{"type": "completed", "total_distance_km": 42.8, "total_duration_min": 64.5, "routes_geometry": [ ... ]}
```

---

## 4. Benchmarking Suite Endpoints

### `POST /api/benchmark/run`
Executes multi-algorithm benchmark comparing QPSO vs Classical PSO vs GA vs ACO vs Exact Methods.

### `GET /api/benchmark/{run_id}`
Fetches comparison table, convergence curves, and runtime metrics for a benchmark run.

### `GET /api/benchmark/history`
Lists all historic benchmark runs stored in the PostgreSQL database.

### `GET /api/benchmark/export/{run_id}`
Downloads benchmark comparison results formatted as a CSV file.
