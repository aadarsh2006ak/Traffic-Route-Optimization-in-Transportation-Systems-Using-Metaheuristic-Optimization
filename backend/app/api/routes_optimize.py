# backend/app/api/routes_optimize.py
from fastapi import APIRouter, HTTPException
from ..models.schemas import OptimizeRunRequest
from ..services.route_service import route_service
from ..utils.validators import validate_nodes_list

router = APIRouter(tags=["Optimization Engine"])

@router.post("/api/optimize/run")
@router.post("/api/v1/optimize")
def run_route_optimization(request: OptimizeRunRequest):
    """
    Executes Vehicle Routing Optimization using Quantum-Behaved PSO (QPSO) or benchmark metaheuristics.
    Produces multi-vehicle schedules, road geometries, cost breakdowns, and live stats.
    """
    start_dict = request.start_location.model_dump()
    stops_dict = [s.model_dump() for s in request.stops]

    validate_nodes_list(start_dict, stops_dict)

    result = route_service.execute_route_optimization(
        start_location=start_dict,
        stops=stops_dict,
        algorithm=request.algorithm or "QPSO",
        num_vehicles=request.num_vehicles or 1,
        vehicle_capacity=request.vehicle_capacity or 0,
        round_trip=request.round_trip or False,
        traffic_enabled=request.traffic_enabled if request.traffic_enabled is not None else True,
        traffic_hour=request.traffic_hour or 9.0,
        hazards_enabled=request.hazards_enabled if request.hazards_enabled is not None else True,
        algorithm_params=request.algorithm_params,
        graph_id=request.graph_id
    )

    return result
