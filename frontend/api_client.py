# frontend/api_client.py
import os
import requests
import streamlit as st
from geopy.geocoders import Nominatim
from typing import List, Dict, Any, Tuple, Optional

# Import direct backend modules for high-speed in-process execution fallback
from backend.app.algorithms import ALGORITHM_REGISTRY, qpso_solver
from backend.app.services.osrm_service import osrm_service
from backend.app.core.constraints import constraint_handler
from backend.app.core.graph_model import transportation_graph
from backend.app.benchmarking.runner import benchmark_runner

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://127.0.0.1:8000/api/v1")

@st.cache_data(ttl=3600)
def search_places(search_term: str):
    """Autocomplete search function using Nominatim with caching."""
    if not search_term: return []
    agent_id = st.session_state.get('user_agent_id', 'unknown')
    geolocator = Nominatim(user_agent=f"quantum_logistics_{agent_id}")
    try:
        locations = geolocator.geocode(search_term, exactly_one=False, limit=5, timeout=4)
        if locations:
            return [(loc.address, {"name": loc.address, "coords": (loc.latitude, loc.longitude)}) for loc in locations]
        return []
    except Exception:
        return []

class APIClient:
    """
    Unified API Client that executes via FastAPI REST endpoints or directly via backend modules.
    """
    def __init__(self, base_url: str = BACKEND_API_URL):
        self.base_url = base_url

    def optimize_route(
        self,
        start_loc: Dict[str, Any],
        stops_data: List[Dict[str, Any]],
        algorithm: str = "QPSO",
        fleet_size: int = 1,
        vehicle_capacity: int = 0,
        round_trip: bool = False,
        traffic_enabled: bool = True,
        traffic_hour: float = 9.0,
        mileage: float = 12.0,
        fuel_price: float = 96.0,
        q_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes optimization using in-process engine or REST API.
        """
        all_nodes = [start_loc] + stops_data
        dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)
        solver = ALGORITHM_REGISTRY.get(algorithm, qpso_solver)

        routes_list, stats = solver.solve(
            start_node=start_loc,
            stops_data=stops_data,
            dist_matrix=dist_matrix,
            time_matrix=time_matrix,
            n_vehicles=fleet_size,
            vehicle_capacity=vehicle_capacity,
            traffic_hour=traffic_hour,
            traffic_enabled=traffic_enabled,
            params=q_params
        )

        total_km = 0.0
        total_min = 0.0
        all_routes_geo = []
        all_markers = []
        all_coords = []
        vehicle_metrics = []

        for v_idx, route_nodes in enumerate(routes_list):
            r_nodes = route_nodes[:]
            if round_trip or fleet_size > 1:
                r_nodes.append(r_nodes[0])

            coords_seq = [n["coords"] for n in r_nodes]
            path_geo, km, mins = osrm_service.get_route_geometry(coords_seq)

            total_km += km
            total_min += mins
            all_routes_geo.append(path_geo if path_geo else coords_seq)

            vehicle_metrics.append({
                "id": v_idx + 1,
                "dist": km,
                "time": mins,
                "stops": len(route_nodes) - 1
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

        mileage_val = max(mileage, 0.1)
        total_fuel = total_km / mileage_val
        total_cost = total_fuel * fuel_price
        validation = constraint_handler.validate_solution(routes_list, vehicle_capacity)

        return {
            "metrics": {
                "dist": total_km,
                "time": total_min,
                "fuel": total_fuel,
                "cost": total_cost,
                "vehicles": vehicle_metrics,
                "validation": validation
            },
            "optimized_route": {
                "markers": all_markers,
                "coords": all_coords,
                "routes_geo": all_routes_geo,
                "raw_routes": routes_list
            },
            "stats": stats
        }

    def run_benchmark(
        self,
        start_loc: Dict[str, Any],
        stops_data: List[Dict[str, Any]],
        algorithms: List[str],
        fleet_size: int = 1,
        vehicle_capacity: int = 0,
        traffic_enabled: bool = True,
        traffic_hour: float = 9.0,
        round_trip: bool = False,
        custom_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return benchmark_runner.run_benchmark(
            start_node=start_loc,
            stops_data=stops_data,
            algorithms_to_run=algorithms,
            fleet_size=fleet_size,
            vehicle_capacity=vehicle_capacity,
            traffic_hour=traffic_hour,
            traffic_enabled=traffic_enabled,
            round_trip=round_trip,
            custom_params=custom_params
        )

    def build_network_graph(
        self,
        nodes: List[Dict[str, Any]],
        routes: Optional[List[List[Dict[str, Any]]]] = None,
        traffic_hour: float = 9.0
    ) -> Tuple[str, Dict[str, Any]]:
        dist_matrix, time_matrix = osrm_service.build_matrices(nodes)
        transportation_graph.build_graph(nodes, dist_matrix, time_matrix, traffic_hour=traffic_hour)
        analytics = transportation_graph.get_graph_analytics()
        dot_str = transportation_graph.generate_graphviz_dot(nodes, routes=routes, traffic_hour=traffic_hour)
        return dot_str, analytics

api_client = APIClient()
