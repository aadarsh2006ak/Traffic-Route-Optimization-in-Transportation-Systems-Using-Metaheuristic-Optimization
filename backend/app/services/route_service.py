# backend/app/services/route_service.py
import time
from typing import List, Dict, Any, Tuple, Optional
from ..optimizers import ALGORITHM_REGISTRY, qpso_solver
from ..services.osrm_service import osrm_service
from ..services.cv_hazard_service import cv_hazard_service
from ..services.db_service import db_service
from ..core.constraints import constraint_handler

class RouteService:
    """
    Coordinates vehicle route optimization, distance/time matrix calculation,
    hazard avoidance integration, OSRM turn-by-turn road geometry, and database persistence.
    """
    def execute_route_optimization(
        self,
        start_location: Dict[str, Any],
        stops: List[Dict[str, Any]],
        algorithm: str = "QPSO",
        num_vehicles: int = 1,
        vehicle_capacity: int = 0,
        round_trip: bool = False,
        traffic_enabled: bool = True,
        traffic_hour: float = 9.0,
        hazards_enabled: bool = True,
        algorithm_params: Dict[str, Any] = None,
        graph_id: str = None
    ) -> Dict[str, Any]:
        all_nodes = [start_location] + stops

        # 1. Build Distance & Time Matrices
        dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)

        # 2. Hazard avoidance
        active_hazards = []
        if hazards_enabled:
            dist_matrix, time_matrix, _ = cv_hazard_service.apply_hazards_to_matrices(
                dist_matrix, time_matrix, all_nodes
            )
            active_hazards = cv_hazard_service.get_active_hazards()

        # 3. Solver selection & execution
        solver = ALGORITHM_REGISTRY.get(algorithm, qpso_solver)
        t_start = time.time()
        
        routes_list, stats = solver.solve(
            start_node=start_location,
            stops_data=stops,
            dist_matrix=dist_matrix,
            time_matrix=time_matrix,
            n_vehicles=num_vehicles,
            vehicle_capacity=vehicle_capacity,
            traffic_hour=traffic_hour,
            traffic_enabled=traffic_enabled,
            params=algorithm_params
        )
        total_runtime = round(time.time() - t_start, 4)

        # 4. Geometry and per-vehicle breakdown
        total_km = 0.0
        total_min = 0.0
        all_routes_geo = []
        all_markers = []
        vehicle_metrics = []

        for v_idx, route_nodes in enumerate(routes_list):
            r_nodes = route_nodes[:]
            if round_trip or num_vehicles > 1:
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
                "stops_count": len(route_nodes) - 1,
                "route_path": [n["name"] for n in route_nodes]
            })

            # Create interactive map markers
            for seq_idx, node in enumerate(r_nodes):
                is_depot = (node["coords"] == start_location["coords"])
                marker_type = "depot" if is_depot else "stop"
                all_markers.append({
                    "vehicle_id": v_idx + 1,
                    "seq": seq_idx,
                    "name": node.get("name", f"Stop {seq_idx}"),
                    "coords": node["coords"],
                    "demand": node.get("demand", 1.0),
                    "type": marker_type,
                    "window": node.get("window", None)
                })

        final_cost = stats.get("best_energy", total_km * 8.0 + (total_min / 60.0) * 50.0)

        # 5. Persist run to Database
        opt_run_id = db_service.save_optimization_run(
            algorithm=algorithm,
            fleet_size=num_vehicles,
            vehicle_capacity=vehicle_capacity,
            total_cost=float(final_cost),
            total_distance_km=round(total_km, 2),
            total_duration_min=round(total_min, 1),
            runtime_sec=total_runtime,
            convergence_history=stats.get("history", []),
            routes_data=vehicle_metrics,
            graph_id=graph_id
        )

        return {
            "status": "success",
            "run_id": opt_run_id,
            "algorithm": algorithm,
            "fleet_size": num_vehicles,
            "total_distance_km": round(total_km, 2),
            "total_duration_min": round(total_min, 1),
            "total_cost": round(float(final_cost), 2),
            "runtime_sec": total_runtime,
            "stats": stats,
            "routes_geometry": all_routes_geo,
            "markers": all_markers,
            "vehicles": vehicle_metrics,
            "active_hazards": active_hazards
        }

route_service = RouteService()
