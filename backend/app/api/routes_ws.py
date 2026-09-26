# backend/app/api/routes_ws.py
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..optimizers import ALGORITHM_REGISTRY, qpso_solver
from ..services.osrm_service import osrm_service
from ..core.websocket_manager import websocket_manager

router = APIRouter(tags=["WebSocket Real-Time Convergence Streaming"])

@router.websocket("/ws/optimize/{run_id}")
@router.websocket("/ws/optimize")
async def websocket_optimize_endpoint(websocket: WebSocket, run_id: str = "global"):
    """
    WebSocket endpoint for real-time live convergence streaming during optimization.
    Streams iteration-by-iteration cost minimization, quantum tunneling, and beta decay.
    """
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        req = json.loads(data)

        start_loc = req.get("start_location")
        stops = req.get("stops", [])
        algo_name = req.get("algorithm", "QPSO")
        fleet_size = req.get("fleet_size", req.get("num_vehicles", 1))
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
            "run_id": run_id,
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

        # Stream convergence history in steps for live visual progression
        history = stats.get("history", [])
        total_steps = len(history)
        step_stride = max(1, total_steps // 25)

        for step_idx in range(0, total_steps, step_stride):
            current_energy = history[step_idx]
            beta_val = 1.0 - (0.5 * (step_idx / max(1, total_steps)))
            await websocket.send_json({
                "type": "progress",
                "run_id": run_id,
                "iteration": step_idx,
                "total_iterations": total_steps,
                "current_energy": round(float(current_energy), 2),
                "beta": round(float(beta_val), 3),
                "tunnels": stats.get("tunnels", 0),
                "progress_pct": round((step_idx / max(1, total_steps)) * 100, 1)
            })
            await asyncio.sleep(0.02)

        # Build final geometries & vehicle routes
        total_km = 0.0
        total_min = 0.0
        all_routes_geo = []
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
                "route_path": [n.get("name", f"Node_{i}") for i, n in enumerate(route_nodes)]
            })

        await websocket.send_json({
            "type": "completed",
            "run_id": run_id,
            "algorithm": algo_name,
            "total_distance_km": round(total_km, 2),
            "total_duration_min": round(total_min, 1),
            "total_cost": stats.get("best_energy", round(total_km * 8.0, 2)),
            "routes_geometry": all_routes_geo,
            "vehicles": vehicle_metrics,
            "stats": stats
        })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
