# backend/app/api/routes_graph.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Tuple
from ..core.graph_model import transportation_graph
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
