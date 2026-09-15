# backend/app/api/routes_benchmark.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from ..benchmarking.runner import benchmark_runner
from ..benchmarking.scenario_runner import scenario_benchmark_manager
from ..services.google_route_service import google_route_service

router = APIRouter(prefix="/api/v1/benchmark", tags=["Benchmarking"])

class LocationNode(BaseModel):
    name: str
    coords: Tuple[float, float]
    demand: Optional[float] = 1.0
    window: Optional[Tuple[float, float]] = None

class BenchmarkRequest(BaseModel):
    start_location: LocationNode
    stops: List[LocationNode]
    algorithms: Optional[List[str]] = ["QPSO", "Simulated Annealing", "Genetic Algorithm", "Ant Colony", "Classical PSO"]
    fleet_size: Optional[int] = Field(default=1, ge=1, le=10)
    vehicle_capacity: Optional[int] = Field(default=0, ge=0)
    traffic_enabled: Optional[bool] = True
    traffic_hour: Optional[float] = 9.0
    round_trip: Optional[bool] = False
    custom_params: Optional[Dict[str, Any]] = None

class ScenarioRunRequest(BaseModel):
    scenario: Optional[str] = "peak_hour"
    node_limit: Optional[int] = Field(default=40, ge=5, le=500)
    fleet_size: Optional[int] = Field(default=4, ge=1, le=15)

@router.post("")
@router.post("/")
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

@router.get("/scenarios")
def get_large_scale_scenarios():
    """
    Returns 500-node large-scale benchmark results across 3 traffic scenarios:
    1. Off-peak (theta = 1.0)
    2. Peak-hour (theta = 1.8)
    3. Disrupted network with CV hazard closures (theta = 2.5)
    """
    return {
        "status": "success",
        "scenarios": scenario_benchmark_manager.get_benchmark_matrix_report()
    }

@router.post("/scenarios/run")
def run_live_scenario(request: ScenarioRunRequest):
    """
    Executes a live benchmark on the 500-node national dataset sample.
    """
    return scenario_benchmark_manager.execute_live_scenario_benchmark(
        scenario_key=request.scenario or "peak_hour",
        node_limit=request.node_limit or 40,
        fleet_size=request.fleet_size or 4
    )

@router.post("/google-baseline")
def run_google_baseline(request: BenchmarkRequest):
    """
    Runs Google Route Optimization API commercial baseline solver.
    """
    start_dict = request.start_location.model_dump()
    stops_dict = [s.model_dump() for s in request.stops]
    
    routes, stats = google_route_service.optimize_with_google(
        start_node=start_dict,
        stops_data=stops_dict,
        n_vehicles=request.fleet_size or 1,
        vehicle_capacity=request.vehicle_capacity or 0,
        traffic_hour=request.traffic_hour or 9.0
    )
    return {
        "status": "success",
        "provider": "Google Route Optimization Baseline",
        "stats": stats,
        "routes": routes
    }
