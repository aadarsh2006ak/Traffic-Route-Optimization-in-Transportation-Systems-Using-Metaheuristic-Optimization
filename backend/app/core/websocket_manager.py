# backend/app/core/websocket_manager.py
import json
import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket

class WebSocketManager:
    """
    Manages active WebSocket connections for live streaming of optimization iterations,
    convergence curves, quantum tunneling transitions, and route previews.
    """
    def __init__(self):
        # Map run_id or client_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, run_id: str = "global"):
        await websocket.accept()
        if run_id not in self.active_connections:
            self.active_connections[run_id] = []
        self.active_connections[run_id].append(websocket)

    def disconnect(self, websocket: WebSocket, run_id: str = "global"):
        if run_id in self.active_connections:
            if websocket in self.active_connections[run_id]:
                self.active_connections[run_id].remove(websocket)
            if not self.active_connections[run_id]:
                del self.active_connections[run_id]

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast_to_run(self, run_id: str, message: Dict[str, Any]):
        if run_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[run_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.append(connection)
            for dead in disconnected:
                self.disconnect(dead, run_id)

    async def stream_convergence_step(
        self,
        websocket: WebSocket,
        iteration: int,
        total_iterations: int,
        best_cost: float,
        current_beta: float = 0.8,
        quantum_tunnels: int = 0,
        algorithm: str = "QPSO",
        route_preview: List[int] = None
    ):
        """
        Sends a single convergence point update to the connected frontend client.
        """
        data = {
            "type": "iteration_update",
            "iteration": iteration,
            "total_iterations": total_iterations,
            "best_cost": round(float(best_cost), 4),
            "beta": round(float(current_beta), 4),
            "quantum_tunnels": quantum_tunnels,
            "algorithm": algorithm,
            "progress_pct": round((iteration / max(1, total_iterations)) * 100, 1),
            "route_preview": route_preview or []
        }
        await websocket.send_text(json.dumps(data))

websocket_manager = WebSocketManager()
