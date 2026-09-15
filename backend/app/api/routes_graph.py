# backend/app/api/routes_graph.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Tuple
# pyrefly: ignore [missing-import]
from ..core.graph_model import transportation_graph
# pyrefly: ignore [missing-import]
from ..core.traffic_sim import traffic_sim
# pyrefly: ignore [missing-import]
from ..services.osrm_service import osrm_service

router = APIRouter(prefix="/api/v1/graph", tags=["Network Graph"])

class LocationNode(BaseModel):
    name: str
    coords: Tuple[float, float]
    demand: Optional[float] = 1.0
    window: Optional[Tuple[float, float]] = None

class GraphBuildRequest(BaseModel):
    nodes: List[LocationNode]
    traffic_hour: Optional[float] = 9.0

@router.post("/build")
def build_network_graph(request: GraphBuildRequest):
    """
    Builds a NetworkX weighted DiGraph for the road network and computes centrality metrics.
    """
    if len(request.nodes) < 2:
        raise HTTPException(status_code=400, detail="At least 2 nodes required to build a graph.")

    nodes_dict = [n.model_dump() for n in request.nodes]
    dist_matrix, time_matrix = osrm_service.build_matrices(nodes_dict)

    transportation_graph.build_graph(
        nodes=nodes_dict,
        dist_matrix=dist_matrix,
        time_matrix=time_matrix,
        traffic_hour=request.traffic_hour
    )

    analytics = transportation_graph.get_graph_analytics()
    dot_str = transportation_graph.generate_graphviz_dot(nodes_dict, traffic_hour=request.traffic_hour)

    return {
        "status": "success",
        "analytics": analytics,
        "dot_graph": dot_str
    }

@router.get("/dynamic-traffic-demo")
def demonstrate_dynamic_traffic_weight_update(hour: float = 8.5):
    """
    Explicit Demonstration of Dynamic Weight Update Mechanism (Deliverable 1):
    Demonstrates how edge travel weights theta(t) update live across the 24-hour cycle
    using the multi-peak Gaussian congestion model.
    """
    factor = traffic_sim.get_congestion_factor(hour)
    status = traffic_sim.get_traffic_status(factor)
    
    # 24-Hour curve profile
    curve = []
    for h in [i * 0.5 for i in range(48)]:
        f = traffic_sim.get_congestion_factor(h)
        curve.append({
            "hour": round(h, 1),
            "time_label": f"{int(h):02d}:{int((h % 1) * 60):02d}",
            "congestion_multiplier": round(f, 3),
            "delay_percent": round((f - 1.0) * 100, 1),
            "peak_period": "Morning Peak" if 7.5 <= h <= 9.5 else ("Evening Rush" if 17.0 <= h <= 19.5 else ("Midday" if 12.5 <= h <= 14.5 else "Off-Peak"))
        })

    # Sample edge demonstration (10 km free-flow link)
    base_km = 10.0
    free_flow_min = (base_km / 45.0) * 60.0
    effective_min = free_flow_min * factor
    added_delay_min = effective_min - free_flow_min

    return {
        "status": "success",
        "query_hour": hour,
        "traffic_factor_theta": round(factor, 3),
        "traffic_status": status,
        "sample_edge_weight_evaluation": {
            "base_distance_km": base_km,
            "free_flow_time_min": round(free_flow_min, 2),
            "effective_congested_time_min": round(effective_min, 2),
            "added_traffic_delay_min": round(added_delay_min, 2),
            "composite_cost_weight": round(base_km * 8.0 + (effective_min / 60.0) * 50.0, 2)
        },
        "full_24h_dynamic_profile": curve
    }
