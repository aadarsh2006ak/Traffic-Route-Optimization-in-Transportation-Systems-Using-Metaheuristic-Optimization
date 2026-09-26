# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import optimize_router, benchmark_router, graph_router, ws_router, hazard_router, history_router
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
## Smart India Hackathon 2026 - Problem Statement ID: 26137
### Quantum-Inspired Intelligent Traffic Route Optimization in Transportation Systems Using Metaheuristic Optimization (QPSO)
**Organization:** Egreen Quanta | **Category:** Software | **Theme:** Transportation & Logistics

### Core Capabilities:
- **Quantum-Inspired Particle Swarm Optimization (QPSO)** with Delta Potential Well wave mechanics and Contraction-Expansion coefficient decay.
- **Benchmark Suite** comparing QPSO against Classical PSO, Genetic Algorithm (GA), Ant Colony Optimization (ACO), and Exact Methods (Dijkstra / A*).
- **Dynamic Road Network Modeling** with time-varying congestion factors $w(i, j, t) = \alpha \cdot d + \beta \cdot t + \gamma \cdot c$.
- **OSMnx Real-World City Extraction & Synthetic Multi-Scale Topologies** (10 to 500 nodes).
- **Real-Time WebSocket Streaming** for live iteration-by-iteration convergence visualization.
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(optimize_router)
app.include_router(benchmark_router)
app.include_router(graph_router)
app.include_router(ws_router)
app.include_router(hazard_router)
app.include_router(history_router)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "organization": settings.ORGANIZATION,
        "problem_statement_id": settings.PROBLEM_STATEMENT_ID,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "graph_load": "/api/graph/load",
            "optimize_run": "/api/optimize/run",
            "benchmark_run": "/api/benchmark/run",
            "websocket_stream": "/ws/optimize/{run_id}"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Quantum-Behaved PSO (Delta Potential Well)",
        "database": "PostgreSQL / SQLite active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
