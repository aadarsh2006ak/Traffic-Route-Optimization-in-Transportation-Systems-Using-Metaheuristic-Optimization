# backend/app/api/__init__.py
from .routes_optimize import router as optimize_router
from .routes_benchmark import router as benchmark_router
from .routes_graph import router as graph_router
from .routes_ws import router as ws_router
