# sessionstate.py
# pyrefly: ignore [missing-import]
import streamlit as st
import uuid

def init_session_state():
    """Initialize all session variables if they don't exist."""
    # Core state variables
    if 'stops_data' not in st.session_state:
        st.session_state.stops_data = []
    if 'optimized_route' not in st.session_state:
        st.session_state.optimized_route = None
    if 'route_metrics' not in st.session_state:
        st.session_state.route_metrics = None
    if 'optimization_stats' not in st.session_state:
        st.session_state.optimization_stats = None
    if 'solver_status' not in st.session_state:
        st.session_state.solver_status = 'Idle'
    if 'is_round_trip_active' not in st.session_state:
        st.session_state.is_round_trip_active = False
    if 'user_agent_id' not in st.session_state:
        st.session_state.user_agent_id = str(uuid.uuid4())[:8]

    # Additional optimization & benchmark variables
    if 'vehicle_capacity' not in st.session_state:
        st.session_state.vehicle_capacity = 0  # 0 = no limit
    if 'traffic_enabled' not in st.session_state:
        st.session_state.traffic_enabled = False
    if 'traffic_hour' not in st.session_state:
        st.session_state.traffic_hour = 9
    if 'algorithm_choice' not in st.session_state:
        st.session_state.algorithm_choice = "QPSO"
    if 'benchmark_results' not in st.session_state:
        st.session_state.benchmark_results = None
    if 'benchmark_running' not in st.session_state:
        st.session_state.benchmark_running = False