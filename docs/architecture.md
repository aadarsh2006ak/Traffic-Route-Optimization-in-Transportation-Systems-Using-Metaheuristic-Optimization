# System Architecture & Technical Specifications

**Smart India Hackathon 2026** | **Problem Statement ID: 26137**
**Vertical:** Quantum Technology | **Theme:** Transportation & Logistics
**Organization:** Egreen Quanta

---

## 1. High-Level Architecture Overview

QuantumRoute is an enterprise-grade, full-stack vehicle routing optimization platform that models urban road networks as dynamic, time-varying weighted graphs and computes optimal multi-vehicle routes using self-implemented **Quantum-Behaved Particle Swarm Optimization (QPSO)** with Delta Potential Well mechanics.

```mermaid
graph TD
    subgraph Data Layer
        A1[OSMnx / OpenStreetMap Real City Grids] --> B[Graph Builder]
        A2[Synthetic Scaled Topologies 10-500 nodes] --> B
        A3[Dynamic Traffic Simulator θ(t)] --> B
    end

    subgraph Optimization Engine
        B --> C1[QPSO Solver: Delta Potential Well]
        B --> C2[Classical PSO Baseline]
        B --> C3[Genetic Algorithm OX Baseline]
        B --> C4[Ant Colony Optimization Baseline]
        B --> C5[Exact Methods: Dijkstra & A*]
    end

    subgraph Backend & API Layer
        C1 & C2 & C3 & C4 & C5 --> D[FastAPI Backend Engine]
        D <--> E[(PostgreSQL / SQLite Database)]
        D --> F[WebSocket Manager: Live Convergence]
    end

    subgraph Frontend Dashboard
        F --> G1[Screen 1: Map Picker & VRP Setup]
        F --> G2[Screen 2: Live Convergence Multi-Chart]
        F --> G3[Screen 3: Final Routes & Benchmark Table]
    end
```

---

## 2. Component Breakdown

### 2.1 Core Optimization Engine (`backend/app/optimizers/`)
- **`qpso.py`:** Core quantum-inspired solver based on wave function collapse in a Delta Potential Well. Features Mean Best Position ($mbest$), Contraction-Expansion coefficient decay ($\beta: 1.0 \to 0.5$), Random-Key discrete encoding, and 2-opt local search.
- **`classical_pso.py`:** Standard velocity-vector PSO ($v_{i}^{t+1} = w v_i + c_1 r_1 (pbest - x) + c_2 r_2 (gbest - x)$) for velocity vs wave comparison.
- **`genetic_algorithm.py`:** Permutation GA with Order Crossover (OX), Inversion Mutation, and Tournament Selection.
- **`ant_colony.py`:** Swarm heuristic with pheromone evaporation $\tau_{ij}$ and distance visibility $\eta_{ij}$.
- **`exact_methods.py`:** Exact branch-and-bound solver + NetworkX Dijkstra/A* baseline wrappers.

### 2.2 Graph & Traffic Simulator (`backend/app/graph/`)
- **`graph_builder.py`:** Extracts real road networks via OSMnx (`ox.graph_from_place`) and generates synthetic networks from 10 to 500 nodes.
- **`traffic_simulator.py`:** Simulates dynamic edge weights $w(i, j, t) = \alpha \cdot d + \beta \cdot t + \gamma \cdot c$ using multi-peak Gaussian rush hour distributions.

### 2.3 Backend API Layer (`backend/app/api/`)
- **`routes_graph.py`:** Graph loading, OSMnx fetch, topological analytics, and 24-hour dynamic traffic profile.
- **`routes_optimize.py`:** Primary vehicle routing optimization endpoint.
- **`routes_benchmark.py`:** Multi-algorithm benchmarking, statistical sweeps, and CSV export.
- **`routes_ws.py`:** Real-time WebSocket streaming for live iteration updates.

### 2.4 Persistence Layer (`backend/app/models/` & `backend/app/services/db_service.py`)
- **PostgreSQL 16** relational database configured with SQLAlchemy models (`road_graphs`, `optimization_runs`, `benchmark_runs`, `benchmark_result_items`).
- Automatic fallback to **SQLite** for zero-configuration local runs.

### 2.5 Frontend Dashboard (`frontend/src/`)
- **3-Screen Workflow:**
  - **Screen 1 (Setup):** City selector, depot & stop point picker on Leaflet map, vehicle count & capacity, weight sliders $\alpha, \beta, \gamma$.
  - **Screen 2 (Live Run):** Live convergence line chart with overlaid algorithm traces, quantum tunneling counters, and progress bar.
  - **Screen 3 (Results):** Multi-vehicle colored route overlay on map, detailed metrics cards, benchmark comparison table, and CSV download.
