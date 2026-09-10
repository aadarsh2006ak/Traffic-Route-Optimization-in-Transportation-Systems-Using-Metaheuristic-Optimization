# backend/app/api/routes_optimize.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from ..algorithms import ALGORITHM_REGISTRY, qpso_solver
from ..services.osrm_service import osrm_service
from ..core.constraints import constraint_handler

router = APIRouter(prefix="/api/v1", tags=["Optimization"])

class LocationNode(BaseModel):
    name: str
    coords: Tuple[float, float]
    demand: Optional[float] = 1.0
    window: Optional[Tuple[float, float]] = None
    service_time: Optional[float] = 0.15

class OptimizeRequest(BaseModel):
    start_location: LocationNode
    stops: List[LocationNode]
    algorithm: Optional[str] = "QPSO"
    fleet_size: Optional[int] = Field(default=1, ge=1, le=10)
    vehicle_capacity: Optional[int] = Field(default=0, ge=0)
    round_trip: Optional[bool] = False
    traffic_enabled: Optional[bool] = True
    traffic_hour: Optional[float] = Field(default=9.0, ge=0.0, le=24.0)
    mileage_km_per_l: Optional[float] = 12.0
    fuel_price_per_l: Optional[float] = 96.0
    algorithm_params: Optional[Dict[str, Any]] = None

@router.post("/optimize")
def optimize_route(request: OptimizeRequest):
    """
    Optimizes vehicle routes using Quantum-Inspired Metaheuristics (QPSO) or classical metaheuristics.
    """
    if not request.stops:
        raise HTTPException(status_code=400, detail="At least one destination stop is required.")

    start_dict = request.start_location.model_dump()
    stops_dict = [s.model_dump() for s in request.stops]
    all_nodes = [start_dict] + stops_dict

    # Build Distance and Time matrices
    dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)

    # Select solver
    algo_name = request.algorithm or "QPSO"
    solver = ALGORITHM_REGISTRY.get(algo_name, qpso_solver)

    # Run Solver
    routes_list, stats = solver.solve(
        start_node=start_dict,
        stops_data=stops_dict,
        dist_matrix=dist_matrix,
        time_matrix=time_matrix,
        n_vehicles=request.fleet_size,
        vehicle_capacity=request.vehicle_capacity,
        traffic_hour=request.traffic_hour,
        traffic_enabled=request.traffic_enabled,
        q_params=request.algorithm_params
    )

    # Process Vehicle Geometries & Markers
    total_km = 0.0
    total_min = 0.0
    all_routes_geo = []
    all_markers = []
    all_coords = []
    vehicle_metrics = []

    for v_idx, route_nodes in enumerate(routes_list):
        r_nodes = route_nodes[:]
        if request.round_trip or request.fleet_size > 1:
            r_nodes.append(r_nodes[0])

        coords_seq = [n["coords"] for n in r_nodes]
        path_geo, km, mins = osrm_service.get_route_geometry(coords_seq)

        total_km += km
        total_min += mins
        all_routes_geo.append(path_geo if path_geo else coords_seq)

        vehicle_metrics.append({
            "vehicle_id": v_idx + 1,
            "distance_km": round(km, 2),
            "duration_min": round(mins, 1),
            "stops_count": len(route_nodes) - 1
        })

        for s_idx, node in enumerate(r_nodes):
            all_markers.append({
                "coords": node["coords"],
                "name": node["name"],
                "vehicle_id": v_idx,
                "stop_idx": s_idx,
                "is_last": (s_idx == len(r_nodes) - 1),
                "window": node.get("window")
            })
            all_coords.append(node["coords"])

    # Fuel & Operational Cost Calculations
    mileage = max(request.mileage_km_per_l, 0.1)
    total_fuel = total_km / mileage
    total_cost = total_fuel * request.fuel_price_per_l

    validation = constraint_handler.validate_solution(routes_list, request.vehicle_capacity)

    return {
        "status": "success",
        "algorithm_used": algo_name,
        "metrics": {
            "distance_km": round(total_km, 2),
            "duration_min": round(total_min, 1),
            "fuel_liters": round(total_fuel, 2),
            "cost_inr": round(total_cost, 2),
            "vehicles": vehicle_metrics,
            "feasibility": validation
        },
        "routes": {
            "markers": all_markers,
            "coords": all_coords,
            "routes_geo": all_routes_geo
        },
        "optimization_stats": stats
    }
