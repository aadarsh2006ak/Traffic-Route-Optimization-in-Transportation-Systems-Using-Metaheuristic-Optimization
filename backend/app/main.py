# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import optimize_router, benchmark_router, graph_router, ws_router

app = FastAPI(
    title="Quantum Route Optimizer API",
    description="Enterprise Quantum-Inspired Metaheuristic (QPSO) Transportation Optimization Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(optimize_router)
app.include_router(benchmark_router)
app.include_router(graph_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "message": "Quantum Route Optimizer API is online.",
        "version": "2.0.0",
        "docs": "/docs",
        "websocket": "/ws/optimize"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine": "Quantum-Behaved PSO Metaheuristic"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
