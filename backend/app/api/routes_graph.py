# backend/app/api/routes_graph.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..models.schemas import GraphLoadRequest
from ..graph.graph_builder import graph_builder
from ..graph.traffic_simulator import traffic_simulator
from ..services.db_service import db_service

router = APIRouter(tags=["Road Network Graph"])

@router.post("/api/graph/load")
@router.post("/api/v1/graph/load")
@router.post("/api/v1/graph/build")
def load_or_build_graph(request: GraphLoadRequest):
    """
    Loads real city road networks via OSMnx or generates controlled synthetic graphs (10-500 nodes).
    Computes NetworkX topological analytics (centrality, clustering, density).
    """
    place = request.place_name or "Delhi, India"
    n_nodes = request.node_count or 20
    g_type = request.graph_type or "osmnx"

    if g_type == "osmnx":
        nodes, dist_mat, time_mat, G = graph_builder.load_osmnx_city_graph(
            place_name=place,
            node_sample_limit=n_nodes,
            traffic_hour=request.traffic_hour
        )
    else:
        nodes, dist_mat, time_mat, G = graph_builder.generate_synthetic_graph(
            node_count=n_nodes,
            traffic_hour=request.traffic_hour
        )

    analytics = graph_builder.get_graph_analytics(G)

    # Save to database
    graph_id = db_service.save_graph(
        name=f"{place} ({n_nodes} nodes)",
        place_name=place,
        graph_type=g_type,
        node_count=len(nodes),
        edge_count=G.number_of_edges(),
        graph_data={
            "nodes": nodes,
            "dist_matrix": dist_mat.tolist(),
            "time_matrix": time_mat.tolist(),
            "analytics": analytics
        }
    )

    return {
        "status": "success",
        "graph_id": graph_id,
        "name": f"{place} ({n_nodes} nodes)",
        "nodes": nodes,
        "analytics": analytics,
        "node_count": len(nodes),
        "edge_count": G.number_of_edges()
    }

@router.get("/api/graph/samples")
@router.get("/api/v1/graph/samples")
def get_sample_graphs():
    """
    Returns list of preset city networks and synthetic multi-scale graphs for instant demonstration.
    """
    return {
        "status": "success",
        "cities": [
            {"id": "delhi_osm", "name": "Delhi NCR (Central Hubs)", "place_name": "Delhi, India", "nodes": 25, "type": "osmnx"},
            {"id": "mumbai_osm", "name": "Mumbai Metropolitan Area", "place_name": "Mumbai, India", "nodes": 20, "type": "osmnx"},
            {"id": "bengaluru_osm", "name": "Bengaluru Tech Corridor", "place_name": "Bengaluru, India", "nodes": 30, "type": "osmnx"},
            {"id": "pune_osm", "name": "Pune Industrial Belt", "place_name": "Pune, India", "nodes": 18, "type": "osmnx"}
        ],
        "synthetic_scales": [
            {"id": "scale_10", "name": "Small Test Network (10 Nodes)", "node_count": 10},
            {"id": "scale_20", "name": "Medium Test Network (20 Nodes)", "node_count": 20},
            {"id": "scale_50", "name": "Large City Grid (50 Nodes)", "node_count": 50},
            {"id": "scale_100", "name": "Metro Scale Network (100 Nodes)", "node_count": 100},
            {"id": "scale_500", "name": "National Logistics Scale (500 Nodes)", "node_count": 500}
        ]
    }

@router.get("/api/graph/traffic-profile")
@router.get("/api/v1/graph/dynamic-traffic-demo")
def get_dynamic_traffic_profile(hour: float = Query(default=8.5, ge=0.0, le=24.0)):
    """
    Dynamic Weight Update Profile w(i, j, t) across the 24-hour cycle.
    """
    factor = traffic_simulator.get_congestion_factor(hour)
    profile = traffic_simulator.get_24h_profile()
    
    base_dist_km = 10.0
    free_flow_min = (base_dist_km / 45.0) * 60.0
    effective_min = free_flow_min * factor

    return {
        "status": "success",
        "query_hour": hour,
        "congestion_factor_theta": round(factor, 3),
        "status_level": "Heavy Congestion" if factor > 1.5 else ("Moderate Delay" if factor > 1.2 else "Smooth Flow"),
        "edge_sample": {
            "base_distance_km": base_dist_km,
            "free_flow_min": round(free_flow_min, 2),
            "effective_congested_min": round(effective_min, 2),
            "added_delay_min": round(effective_min - free_flow_min, 2),
            "composite_weight": round(traffic_simulator.compute_edge_weight(base_dist_km, effective_min/60.0, factor), 2)
        },
        "full_24h_curve": profile
    }

@router.get("/api/graph/{graph_id}")
@router.get("/api/v1/graph/{graph_id}")
def get_graph_by_id(graph_id: str):
    """
    Fetches stored graph nodes, coordinates, distance matrices, and topological metrics.
    """
    data = db_service.get_graph(graph_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Graph with ID '{graph_id}' not found.")
    return {"status": "success", "graph": data}
