# frontend/app.py
import time
import streamlit as st
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from frontend import config, sessionstate
from frontend.api_client import api_client
from frontend.components import (
    render_sidebar,
    render_optimizer_view,
    render_analytics_view,
    render_benchmark_view,
    render_graph_view,
    render_math_view
)

def render_header():
    """Renders the top title and Cyberpunk System Status HUD."""
    st.title("⚛️ Quantum Logistics Pro")
    
    status = st.session_state.get('solver_status', 'Idle')
    if status == 'Completed':
        solver_pill = '<span style="background: rgba(0, 230, 118, 0.1); border: 1px solid #00e676; color: #00e676; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: \'Roboto\', sans-serif;">✅ Solver Completed</span>'
    elif status == 'Running':
        solver_pill = '<span style="background: rgba(255, 145, 0, 0.1); border: 1px solid #ff9100; color: #ff9100; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: \'Roboto\', sans-serif;">⏳ Optimization Running</span>'
    elif status == 'Failed':
        solver_pill = '<span style="background: rgba(255, 43, 43, 0.1); border: 1px solid #ff2b2b; color: #ff2b2b; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: \'Roboto\', sans-serif;">❌ System Error</span>'
    else:
        solver_pill = '<span style="background: rgba(255, 255, 255, 0.08); border: 1px solid #a0aab5; color: #a0aab5; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: \'Roboto\', sans-serif;">💤 Engine Ready</span>'

    algo = st.session_state.get('algorithm_choice', 'QPSO')
    st.markdown(f"""
    <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
        <span style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: 'Roboto', sans-serif;">
            🟢 Core Active: {algo}
        </span>
        {solver_pill}
        <span style="background: rgba(188, 19, 254, 0.1); border: 1px solid #bc13fe; color: #bc13fe; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; font-family: 'Roboto', sans-serif;">
            📊 Telemetry & Benchmark Active
        </span>
    </div>
    """, unsafe_allow_html=True)

def main():
    # 1. Setup Page & State
    st.set_page_config(**config.PAGE_CONFIG)
    config.load_css()
    sessionstate.init_session_state()
    
    render_header()

    # 2. Render Sidebar Inputs
    page, start_loc, is_round_trip, mileage, fuel_price, fleet_size, q_params, go_btn = render_sidebar()

    if start_loc:
        st.session_state.start_loc = start_loc
    st.session_state.fleet_size = fleet_size
    st.session_state.is_round_trip_active = is_round_trip

    # 3. Main Optimization Trigger
    if go_btn:
        if not start_loc:
            st.error("⚠️ Please select a Start Location / Depot.")
            st.session_state.solver_status = "Failed"
        elif not st.session_state.stops_data:
            st.error("⚠️ Please add or load at least one destination stop.")
            st.session_state.solver_status = "Failed"
        else:
            algo_choice = st.session_state.get('algorithm_choice', 'QPSO')
            with st.status(f"🚀 Launching {algo_choice} Optimization Engine...", expanded=True) as status:
                st.write("⚡ Initializing energy landscape & weighted graph...")
                time.sleep(0.3)
                st.write(f"⚛️ Running {algo_choice} quantum/metaheuristic convergence...")
                
                st.session_state.solver_status = "Running"
                
                try:
                    result = api_client.optimize_route(
                        start_loc=start_loc,
                        stops_data=st.session_state.stops_data,
                        algorithm=algo_choice,
                        fleet_size=fleet_size,
                        vehicle_capacity=st.session_state.get('vehicle_capacity', 0),
                        round_trip=is_round_trip,
                        traffic_enabled=st.session_state.get('traffic_enabled', True),
                        traffic_hour=st.session_state.get('traffic_hour', 9.0),
                        mileage=mileage,
                        fuel_price=fuel_price,
                        q_params=q_params
                    )
                    
                    st.session_state.route_metrics = result["metrics"]
                    st.session_state.optimized_route = result["optimized_route"]
                    st.session_state.optimization_stats = result["stats"]
                    st.session_state.solver_status = "Completed"
                    
                    status.update(label=f"✅ {algo_choice} Optimization Complete!", state="complete", expanded=False)
                    time.sleep(0.4)
                    st.rerun()
                except Exception as e:
                    st.session_state.solver_status = "Failed"
                    st.error(f"Optimization error: {e}")
                    status.update(label="❌ Optimization Failed", state="error", expanded=True)

    # 4. Render Page Views
    if page == "Route Optimizer":
        render_optimizer_view()
    elif page == "Quantum Analytics":
        render_analytics_view()
    elif page == "Benchmark Lab":
        render_benchmark_view()
    elif page == "Network Graph":
        render_graph_view()
    elif page == "Mathematical Docs":
        render_math_view()

if __name__ == "__main__":
    main()
