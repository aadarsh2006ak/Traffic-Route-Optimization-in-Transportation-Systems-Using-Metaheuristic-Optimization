# System Architecture & Technical Specifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER (UI)                           │
│  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────────────┐  │
│  │ Route Optimizer HUD│ │ Quantum Analytics  │ │ Algorithm Benchmark Lab │  │
│  │ (Folium Road Maps) │ │ (Convergence Curve)│ │ (Multi-Algo Comparisons)│  │
│  └────────────────────┘ └────────────────────┘ └─────────────────────────┘  │
│  ┌─────────────────────────────────┐ ┌───────────────────────────────────┐  │
│  │  Network Graph Visualizer (DiG) │ │  Mathematical Docs (LaTeX Model)  │  │
│  └─────────────────────────────────┘ └───────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / In-Process Fast Bridge
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            BACKEND & LOGIC ENGINE                           │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │     Graph Network Layer         │   │   Traffic Congestion Engine     │  │
│  │  • NetworkX DiGraph Builder     │   │  • Time-of-Day Multipliers θ(t) │  │
│  │  • Centrality & Topology Metrics│   │  • Dynamic Edge Latency         │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │    Constraint Validation        │   │     Geospatial Routing API      │  │
│  │  • Capacity Check (CVRP)        │   │  • OSRM Road Geometry Table     │  │
│  │  • Time Windows & Service Times │   │  • Nominatim Geocoding Cache    │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         METAHEURISTIC SOLVER ARSENAL                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ QPSO Solver  │ │ SA + Tunnel  │ │  GA (OX1)    │ │    ACO Engine      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────────┘  │
│  ┌───────────────────────────────┐ ┌─────────────────────────────────────┐  │
│  │ Classical PSO Metaheuristic   │ │ Exact MILP / Branch & Bound Solver  │  │
│  └───────────────────────────────┘ └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modular Directory Map

```
quantum-route-optimiser/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI REST API entrypoint
│   │   ├── api/                    # API route endpoints (/optimize, /benchmark, /graph)
│   │   ├── core/                   # NetworkX Graph model, Traffic simulation, Constraints
│   │   ├── algorithms/             # QPSO, SA, GA, ACO, Classical PSO, Exact Solver
│   │   ├── benchmarking/           # Multi-algorithm benchmark runner & convergence extraction
│   │   └── services/               # OSRM & TomTom routing clients
│   ├── requirements.txt
│   └── tests/                      # Pytest automated test suite
├── frontend/
│   ├── app.py                      # Main Streamlit dashboard
│   ├── api_client.py               # REST / Direct execution client
│   ├── components/                 # Map, ParamPanel, Analytics, Benchmark, Graph, Math
│   ├── config.py                   # Cyberpunk styling tokens
│   └── sessionstate.py             # Reactive session state
├── docs/                           # Math formulation, Architecture & Benchmark reports
├── data/                           # 10, 40, 100, 500 node datasets & benchmark outputs
└── notebooks/                      # Jupyter benchmark evaluation notebook
```
