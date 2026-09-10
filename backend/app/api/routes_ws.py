# backend/app/api/routes_ws.py
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..algorithms import ALGORITHM_REGISTRY, qpso_solver
from ..services.osrm_service import osrm_service
from ..core.constraints import constraint_handler

router = APIRouter(tags=["WebSocket Real-Time Streaming"])

@router.websocket("/ws/optimize")
async def websocket_optimize(websocket: WebSocket):
    """
    WebSocket endpoint for real-time live convergence streaming during optimization.
    Streams iteration-by-iteration energy minimization, quantum tunneling, and beta decay.
    """
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        req = json.loads(data)

        start_loc = req.get("start_location")
        stops = req.get("stops", [])
        algo_name = req.get("algorithm", "QPSO")
        fleet_size = req.get("fleet_size", 1)
        vehicle_capacity = req.get("vehicle_capacity", 0)
        round_trip = req.get("round_trip", False)
        traffic_enabled = req.get("traffic_enabled", True)
        traffic_hour = req.get("traffic_hour", 9.0)
        q_params = req.get("algorithm_params", {})

        all_nodes = [start_loc] + stops
        dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)
        solver = ALGORITHM_REGISTRY.get(algo_name, qpso_solver)

        # Notify Start
        await websocket.send_json({
            "type": "start",
            "message": f"Starting {algo_name} optimization engine...",
            "nodes_count": len(all_nodes)
        })
        await asyncio.sleep(0.05)

        # Execute optimization
        routes_list, stats = solver.solve(
            start_node=start_loc,
            stops_data=stops,
            dist_matrix=dist_matrix,
            time_matrix=time_matrix,
            n_vehicles=fleet_size,
            vehicle_capacity=vehicle_capacity,
            traffic_hour=traffic_hour,
            traffic_enabled=traffic_enabled,
            params=q_params
        )

        # Stream convergence history in chunks for live visualization
        history = stats.get("history", [])
        total_steps = len(history)
        step_stride = max(1, total_steps // 20)

        for step_idx in range(0, total_steps, step_stride):
            current_energy = history[step_idx]
            await websocket.send_json({
                "type": "progress",
                "iteration": step_idx,
                "total_iterations": total_steps,
                "current_energy": round(float(current_energy), 2),
                "tunnels": stats.get("tunnels", 0),
                "progress_pct": round((step_idx / max(1, total_steps)) * 100, 1)
            })
            await asyncio.sleep(0.02)

        # Geometries & Final Metrics
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

        mileage = float(req.get("mileage_km_per_l", 12.0))
        fuel_price = float(req.get("fuel_price_per_l", 96.0))
        total_fuel = total_km / max(mileage, 0.1)
        total_cost = total_fuel * fuel_price
        validation = constraint_handler.validate_solution(routes_list, vehicle_capacity)

        # Send Final Complete Event
        await websocket.send_json({
            "type": "complete",
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
        })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
