# backend/app/api/routes_benchmark.py
from fastapi import APIRouter, HTTPException, Response
from typing import List, Optional
from ..models.schemas import BenchmarkRunRequest
from ..services.benchmark_service import benchmark_service
from ..services.db_service import db_service
from ..benchmarking.scenario_runner import scenario_benchmark_manager
from ..utils.validators import validate_nodes_list

router = APIRouter(tags=["Benchmarking Suite"])

@router.post("/api/benchmark/run")
@router.post("/api/v1/benchmark")
@router.post("/api/v1/benchmark/")
def execute_benchmark_suite(request: BenchmarkRunRequest):
    """
    Executes a comprehensive benchmark comparing QPSO vs Classical PSO vs GA vs ACO vs Exact Methods.
    Returns convergence curves, total cost, travel times, runtime, and statistical stability.
    """
    start_dict = request.start_location.model_dump()
    stops_dict = [s.model_dump() for s in request.stops]

    validate_nodes_list(start_dict, stops_dict)

    results = benchmark_service.run_benchmark_suite(
        start_node=start_dict,
        stops_data=stops_dict,
        algorithms_to_run=request.algorithms or ["QPSO", "Classical PSO", "Genetic Algorithm", "Ant Colony", "Exact Solver"],
        fleet_size=request.num_vehicles or 1,
        vehicle_capacity=request.vehicle_capacity or 0,
        traffic_hour=request.traffic_hour or 9.0,
        traffic_enabled=request.traffic_enabled if request.traffic_enabled is not None else True,
        trials_per_algo=request.trials_per_algo or 1,
        custom_params=request.custom_params,
        graph_id=request.graph_id
    )

    return results

@router.get("/api/benchmark/{run_id}")
@router.get("/api/v1/benchmark/{run_id}")
def get_benchmark_run_by_id(run_id: str):
    """
    Fetches the final comparison table and convergence traces for a past benchmark run.
    """
    data = db_service.get_benchmark_run(run_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Benchmark run with ID '{run_id}' not found.")
    return {"status": "success", "benchmark": data}

@router.get("/api/benchmark/history")
@router.get("/api/v1/benchmark/history")
def get_benchmark_history():
    """
    Lists past benchmark runs with summary statistics.
    """
    history = db_service.get_recent_benchmark_history(limit=25)
    return {"status": "success", "history": history}

@router.get("/api/benchmark/export/{run_id}")
def export_benchmark_csv(run_id: str):
    """
    Downloads benchmark comparison results as a CSV file.
    """
    data = db_service.get_benchmark_run(run_id)
    if not data or "results" not in data:
        raise HTTPException(status_code=404, detail=f"Benchmark run '{run_id}' not found.")
    
    csv_str = benchmark_service.generate_csv_report(data["results"])
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=benchmark_{run_id}.csv"}
    )

@router.get("/api/v1/benchmark/scenarios")
def get_large_scale_scenarios():
    """
    500-Node national benchmark matrix across off-peak, peak-hour, and hazard scenarios.
    """
    return {
        "status": "success",
        "scenarios": scenario_benchmark_manager.get_benchmark_matrix_report()
    }
