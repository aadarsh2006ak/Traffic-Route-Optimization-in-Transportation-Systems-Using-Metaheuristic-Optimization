# frontend/sessionstate.py
import streamlit as st
import uuid

def init_session_state():
    """Initializes reactive session state for the Streamlit dashboard."""
    defaults = {
        "stops_data": [],
        "optimized_route": None,
        "route_metrics": None,
        "optimization_stats": None,
        "solver_status": "Idle",
        "is_round_trip_active": False,
        "user_agent_id": str(uuid.uuid4())[:8],
        "vehicle_capacity": 0,
        "traffic_enabled": True,
        "traffic_hour": 9.0,
        "algorithm_choice": "QPSO",
        "benchmark_results": None,
        "benchmark_running": False,
        "backend_mode": "Local Direct"  # 'Local Direct' or 'FastAPI REST'
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val
