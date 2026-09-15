# backend/app/api/routes_history.py
from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.db_service import db_service

router = APIRouter(prefix="/api/v1/history", tags=["History & Persistence"])

@router.get("/runs")
def get_optimization_history(limit: int = 25) -> Dict[str, Any]:
    """
    Returns recent vehicle route optimization runs from SQLite database.
    """
    runs = db_service.get_recent_runs(limit=limit)
    return {
        "status": "success",
        "total_records": len(runs),
        "runs": runs
    }

@router.get("/benchmarks")
def get_benchmark_history(limit: int = 10) -> Dict[str, Any]:
    """
    Returns recent benchmark execution runs from SQLite database.
    """
    history = db_service.get_benchmark_history(limit=limit)
    return {
        "status": "success",
        "total_records": len(history),
        "benchmarks": history
    }
