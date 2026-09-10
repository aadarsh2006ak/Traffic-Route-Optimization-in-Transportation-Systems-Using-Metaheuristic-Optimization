# backend/app/api/routes_benchmark.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from ..benchmarking.runner import benchmark_runner

router = APIRouter(prefix="/api/v1", tags=["Benchmarking"])

class LocationNode(BaseModel):
    name: str
    coords: Tuple[float, float]
    demand: Optional[float] = 1.0
    window: Optional[Tuple[float, float]] = None

class BenchmarkRequest(BaseModel):
    start_location: LocationNode
    stops: List[LocationNode]
    algorithms: Optional[List[str]] = ["QPSO", "Simulated Annealing", "Genetic Algorithm", "Ant Colony"]
    fleet_size: Optional[int] = Field(default=1, ge=1, le=10)
    vehicle_capacity: Optional[int] = Field(default=0, ge=0)
    traffic_enabled: Optional[bool] = True
    traffic_hour: Optional[float] = 9.0
    round_trip: Optional[bool] = False
    custom_params: Optional[Dict[str, Any]] = None

@router.post("/benchmark")
def run_benchmark_suite(request: BenchmarkRequest):
    """
    Executes a multi-algorithm benchmark comparing QPSO against classical metaheuristics.
    """
    if not request.stops:
        raise HTTPException(status_code=400, detail="Stops list cannot be empty.")

    start_dict = request.start_location.model_dump()
    stops_dict = [s.model_dump() for s in request.stops]

    results = benchmark_runner.run_benchmark(
        start_node=start_dict,
        stops_data=stops_dict,
        algorithms_to_run=request.algorithms,
        fleet_size=request.fleet_size,
        vehicle_capacity=request.vehicle_capacity,
        traffic_hour=request.traffic_hour,
        traffic_enabled=request.traffic_enabled,
        round_trip=request.round_trip,
        custom_params=request.custom_params
    )

    return {
        "status": "success",
        "summary": results["summary_table"].to_dict(orient="records"),
        "convergence": results["convergence_df"].to_dict(orient="list"),
        "runtimes": results["runtime_df"].reset_index().to_dict(orient="records")
    }
