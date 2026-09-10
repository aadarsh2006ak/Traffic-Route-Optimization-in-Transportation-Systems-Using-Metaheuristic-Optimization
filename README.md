# Quantum-Inspired Metaheuristic Route Optimization in Transportation Systems ⚛️🚦

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.40+-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![NetworkX](https://img.shields.io/badge/NetworkX-Graph_Engine-blue?style=for-the-badge)
![Metaheuristics](https://img.shields.io/badge/Metaheuristics-QPSO%20|%20SA%20|%20GA%20|%20ACO%20|%20PSO-9cf?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

An enterprise-grade, modular transportation logistics optimization engine featuring **Quantum-Behaved Particle Swarm Optimization (QPSO)**, **Simulated Annealing with Quantum Tunneling**, **Genetic Algorithms (OX1)**, **Ant Colony Optimization (ACO)**, and **Exact Solvers** for dynamic Capacitated Vehicle Routing with Time Windows (CVRPTW), real-time traffic congestion modeling, and formal NetworkX graph analytics.

---

## 📌 Table of Contents
- [🎯 Executive Summary & Problem Statement](#-executive-summary--problem-statement)
- [🏗️ Modular Directory Structure](#️-modular-directory-structure)
- [📐 Mathematical Formulation](#-mathematical-formulation)
- [⚛️ Core Metaheuristic Algorithms](#️-core-metaheuristic-algorithms)
- [🚦 Real-Time & Peak-Hour Traffic Engine](#-real-time--peak-hour-traffic-engine)
- [🏁 Benchmark Lab & Convergence Analysis](#-benchmark-lab--convergence-analysis)
- [⚡ Installation & Quickstart](#-installation--quickstart)
- [🧪 Automated Test Suite](#-automated-test-suite)
- [📊 Evaluation & Experimental Results](#-evaluation--experimental-results)

---

## 🎯 Executive Summary & Problem Statement

Modern transportation and urban logistics face severe challenges in route efficiency, operational fuel costs, and carbon emissions due to:
1. **Combinatorial Explosion**: The Vehicle Routing Problem (VRP) is NP-hard ($O(N!)$).
2. **Dynamic Traffic Congestion**: Time-varying peak-hour bottlenecks distort static shortest paths.
3. **Multi-Constraint Realities**: Fleet capacities, delivery time windows, and maximum tour limits.

**Our Solution**: A decoupled enterprise platform implementing **Quantum-Behaved Particle Swarm Optimization (QPSO)** embedded with delta-potential well wave mechanics, continuous random-key permutation decoding, and multi-algorithm benchmarking against conventional metaheuristics.

---

## 🏗️ Modular Directory Structure

```
quantum-route-optimiser/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI REST API entrypoint & OpenAPI docs
│   │   ├── api/
│   │   │   ├── routes_optimize.py  # /api/v1/optimize endpoint
│   │   │   ├── routes_benchmark.py # /api/v1/benchmark endpoint
│   │   │   └── routes_graph.py     # /api/v1/graph endpoints
│   │   ├── core/
│   │   │   ├── graph_model.py      # NetworkX weighted DiGraph builder
│   │   │   ├── constraints.py      # CVRPTW capacity, time-window, penalty fns
│   │   │   └── traffic_sim.py      # Gaussian peak-hour traffic multiplier θ(t)
│   │   ├── algorithms/
│   │   │   ├── qpso.py             # Quantum Particle Swarm Optimization (Primary)
│   │   │   ├── simulated_annealing.py # SA with Quantum Tunneling & 2-Opt
│   │   │   ├── genetic_algorithm.py   # GA with Order Crossover (OX1) & mutation
│   │   │   ├── ant_colony.py          # ACO with pheromone matrix & visibility
│   │   │   ├── classical_pso.py       # Classical continuous PSO
│   │   │   ├── exact_solver.py        # Exact branch & bound / PuLP baseline (N <= 12)
│   │   │   └── shortest_path.py       # Dijkstra & A* pathfinding
│   │   ├── benchmarking/
│   │   │   ├── runner.py           # Multi-algorithm benchmark executor
│   │   │   ├── metrics.py          # Optimality gap %, runtime, iterations
│   │   │   └── convergence_plot.py # Convergence curve extraction
│   │   └── services/
│   │       ├── osrm_service.py     # OSRM road distance & duration matrix
│   │       └── tomtom_service.py   # TomTom live traffic client
│   ├── requirements.txt
│   └── tests/
│       ├── test_qpso.py
│       ├── test_constraints.py
│       └── test_benchmarks.py
├── frontend/
│   ├── app.py                      # Streamlit interactive dashboard
│   ├── api_client.py               # REST client & high-speed direct engine bridge
│   ├── config.py                   # Cyberpunk styling tokens & CSS
│   ├── sessionstate.py             # Session state initialization
│   └── components/
│       ├── map_view.py             # Live Folium map with traffic polylines & manifest export
│       ├── param_panel.py          # Sidebar inputs, demo loaders & hyperparameters
│       ├── analytics_view.py       # Energy landscape & QPSO beta curves
│       ├── benchmark_view.py       # Multi-algorithm benchmark lab & summary tables
│       ├── graph_view.py           # NetworkX graph topology visualizer
│       └── math_view.py            # LaTeX mathematical formulation models
├── docs/
│   ├── mathematical_formulation.md # Full LaTeX mathematical formulation
│   ├── architecture.md             # System architecture & data flow diagrams
│   └── benchmark_report.md         # Comprehensive experimental evaluation
├── data/
│   ├── demo_graphs/
│   │   ├── 10_nodes_city.csv       # 10-node intra-city logistics dataset
│   │   ├── 40_nodes_state.csv      # 40-node state-wide distribution dataset
│   │   ├── 100_nodes_metro.csv     # 100-node metropolitan cluster dataset
│   │   └── 500_nodes_national.csv  # 500-node national delivery network
│   └── results/
│       └── sample_benchmark_results.csv
├── notebooks/
│   └── benchmark_analysis.ipynb    # Jupyter benchmark evaluation notebook
├── run_backend.py                  # FastAPI backend server launcher
├── run_frontend.py                 # Streamlit frontend dashboard launcher
├── requirements.txt                # Unified root requirements
└── README.md
```

---

## 📐 Mathematical Formulation

### 1. Multi-Objective Cost Function
$$\min \mathcal{Z} = \sum_{k \in K} \sum_{i \in V} \sum_{j \in V, j \neq i} \Big( c_{\text{fuel}} \cdot d_{ij} + c_{\text{time}} \cdot t_{ij} \cdot \theta(s_{ik}) \Big) x_{ijk} + \sum_{i \in V'} \mathcal{P}_{\text{TW}}(s_i) + \sum_{k \in K} \mathcal{P}_{\text{Cap}}(u_k)$$

### 2. Quantum Delta Potential Well Equations (QPSO)
1. **Mean Best Position ($mBest$)**:
   $$mBest(t) = \frac{1}{M} \sum_{i=1}^{M} P_i(t)$$
2. **Local Attractor ($p_i$)**:
   $$p_{id}(t) = \phi_d(t) P_{id}(t) + (1 - \phi_d(t)) G_d(t), \quad \phi_d \sim \mathcal{U}(0, 1)$$
3. **Position Update Equation**:
   $$X_{id}(t+1) = p_{id}(t) \pm \beta(t) \cdot |mBest_d(t) - X_{id}(t)| \cdot \ln\left(\frac{1}{u_{id}(t)}\right), \quad u_{id} \sim \mathcal{U}(0, 1)$$
4. **Contraction-Expansion Schedule**:
   $$\beta(t) = \beta_{\max} - \frac{t}{T_{\max}}(\beta_{\max} - \beta_{\min})$$

---

## ⚡ Installation & Quickstart

### 1. Clone & Setup Environment
```bash
git clone https://github.com/aadarsh2006ak/Traffic-Route-Optimization-in-Transportation-Systems-Using-Metaheuristic-Optimization.git
cd Traffic-Route-Optimization-in-Transportation-Systems-Using-Metaheuristic-Optimization

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# source venv/bin/activate    # Linux / macOS

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Application
You can run the frontend dashboard directly or run both backend and frontend:

- **Launch Streamlit Dashboard**:
  ```bash
  python run_frontend.py
  # or: streamlit run frontend/app.py
  ```
  Open browser at `http://localhost:8501`.

- **Launch FastAPI Backend (Optional REST Mode)**:
  ```bash
  python run_backend.py
  ```
  Open Swagger documentation at `http://127.0.0.1:8000/docs`.

---

## 🧪 Automated Test Suite

Run unit and integration tests using `pytest`:
```bash
pytest backend/tests/ -v
```

---

## 📊 Evaluation & Experimental Results

### 40-Node Benchmark Comparison

| Algorithm | Best Distance (km) | Optimality Gap (%) | Execution Time (s) | Iterations |
| :--- | :---: | :---: | :---: | :---: |
| **QPSO (Quantum PSO)** | **1,842.6 km** | **0.00% (Best)** | **1.42 s** | **340** |
| **Simulated Annealing** | 1,889.1 km | +2.52% | 1.85 s | 1,200 |
| **Ant Colony (ACO)** | 1,912.0 km | +3.76% | 4.10 s | 190 |
| **Genetic Algorithm (GA)** | 1,934.4 km | +4.98% | 2.65 s | 780 |
| **Classical PSO** | 2,045.8 km | +11.02% | 1.98 s | 620 |
| **Exact Solver ($N \le 12$)** | Optimal | 0.00% | 18.90 s | Exact |
