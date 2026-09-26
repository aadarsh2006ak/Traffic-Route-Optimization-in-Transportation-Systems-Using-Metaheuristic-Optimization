# backend/app/utils/validators.py
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException

def validate_nodes_list(start_node: Dict[str, Any], stops: List[Dict[str, Any]]) -> None:
    """
    Validates location node structure and coordinate ranges.
    """
    if not start_node or "coords" not in start_node:
        raise HTTPException(status_code=400, detail="Start location depot must have valid coordinates.")

    lat, lon = start_node["coords"]
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
        raise HTTPException(status_code=400, detail=f"Depot coordinates ({lat}, {lon}) are out of geographic bounds.")

    if not stops or len(stops) == 0:
        raise HTTPException(status_code=400, detail="At least one stop point is required for route optimization.")

    for idx, stop in enumerate(stops):
        if "coords" not in stop:
            raise HTTPException(status_code=400, detail=f"Stop #{idx+1} is missing coordinates.")
        s_lat, s_lon = stop["coords"]
        if not (-90.0 <= s_lat <= 90.0 and -180.0 <= s_lon <= 180.0):
            raise HTTPException(status_code=400, detail=f"Stop #{idx+1} coordinates ({s_lat}, {s_lon}) out of bounds.")

def validate_vrp_feasibility(stops: List[Dict[str, Any]], num_vehicles: int, vehicle_capacity: int) -> None:
    """
    Checks if vehicle count and capacity can theoretically satisfy total customer demand.
    """
    if vehicle_capacity > 0:
        total_demand = sum(s.get("demand", 1.0) for s in stops)
        total_capacity = num_vehicles * vehicle_capacity
        if total_demand > total_capacity:
            # Not an error, but high penalty will be imposed
            pass
