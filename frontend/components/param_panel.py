# frontend/components/param_panel.py
import os
import streamlit as st
import pandas as pd
from streamlit_searchbox import st_searchbox
from ..api_client import search_places

def _load_stops_from_df(df: pd.DataFrame) -> int:
    """Helper to parse CSV and append valid location stops."""
    if {'name', 'lat', 'lon'}.issubset(df.columns):
        count = 0
        for _, row in df.iterrows():
            s_time = float(row['start_time']) if 'start_time' in row else 9.0
            e_time = float(row['end_time']) if 'end_time' in row else 18.0
            demand = float(row['demand']) if 'demand' in row else 1.0
            st.session_state.stops_data.append({
                "name": str(row['name']),
                "coords": (float(row['lat']), float(row['lon'])),
                "window": (s_time, e_time),
                "demand": demand
            })
            count += 1
        return count
    else:
        st.error("CSV columns needed: name, lat, lon (optional: demand, start_time, end_time)")
        return 0

def render_sidebar():
    """Renders the Input Sidebar and Hyperparameters."""
    with st.sidebar:
        st.image("https://img.icons8.com/color/96/delivery--v1.png", width=55)
        st.title("Quantum Logistics")
        
        # Navigation
        page = st.radio(
            "Navigation", 
            ["Route Optimizer", "Quantum Analytics", "Benchmark Lab", "Network Graph", "Mathematical Docs"], 
            label_visibility="collapsed"
        )
        st.markdown("---")
        
        # --- Group 1: Route Input ---
        with st.expander("📍 Route & Hub Configuration", expanded=True):
            tab_search, tab_upload = st.tabs(["Search", "Upload & Demos"])
            
            with tab_search:
                start_loc = st_searchbox(search_places, key="start_box", label="Start Location / Central Hub")
                st.markdown("---")
                new_stop = st_searchbox(search_places, key="stop_box", label="Add Customer Stop")
                
                if st.button("➕ Add Location", use_container_width=True):
                    if new_stop:
                        names = [s['name'] for s in st.session_state.stops_data]
                        if new_stop['name'] not in names:
                            st.session_state.stops_data.append(new_stop)
                            st.success("Added!")
                        else:
                            st.warning("Location already added.")
            
            with tab_upload:
                uploaded = st.file_uploader("Upload CSV", type=['csv'])
                if uploaded and st.button("Process CSV", use_container_width=True):
                    try:
                        df = pd.read_csv(uploaded)
                        count = _load_stops_from_df(df)
                        if count > 0:
                            st.success(f"Loaded {count} locations!")
                    except Exception as e:
                        st.error(f"Error loading CSV: {e}")
                
                st.markdown("---")
                st.caption("Benchmark Datasets")
                col_d1, col_d2 = st.columns(2)
                with col_d1:
                    if st.button("📂 10 Nodes (City)", use_container_width=True):
                        st.session_state.stops_data = []
                        path = os.path.join("data", "demo_graphs", "10_nodes_city.csv")
                        if not os.path.exists(path): path = "demo_stops.csv"
                        if os.path.exists(path):
                            _load_stops_from_df(pd.read_csv(path))
                            st.toast("10-Node City dataset loaded", icon="✅")
                    if st.button("📂 100 Nodes (Metro)", use_container_width=True):
                        st.session_state.stops_data = []
                        path = os.path.join("data", "demo_graphs", "100_nodes_metro.csv")
                        if os.path.exists(path):
                            _load_stops_from_df(pd.read_csv(path))
                            st.toast("100-Node Metro dataset loaded", icon="✅")
                with col_d2:
                    if st.button("📂 40 Nodes (State)", use_container_width=True):
                        st.session_state.stops_data = []
                        path = os.path.join("data", "demo_graphs", "40_nodes_state.csv")
                        if not os.path.exists(path): path = "demo_stops_40.csv"
                        if os.path.exists(path):
                            _load_stops_from_df(pd.read_csv(path))
                            st.toast("40-Node State dataset loaded", icon="✅")
                    if st.button("📂 500 Nodes (Enterprise)", use_container_width=True):
                        st.session_state.stops_data = []
                        path = os.path.join("data", "demo_graphs", "500_nodes_national.csv")
                        if os.path.exists(path):
                            _load_stops_from_df(pd.read_csv(path))
                            st.toast("500-Node National dataset loaded", icon="✅")

            if st.session_state.stops_data:
                st.markdown(f"**Selected Stops ({len(st.session_state.stops_data)})**")
                for i, s in enumerate(st.session_state.stops_data[:8]):
                    c1, c2 = st.columns([0.85, 0.15])
                    time_str = f" 🕒 {s['window'][0]:.0f}-{s['window'][1]:.0f}h" if 'window' in s and s['window'] else ""
                    c1.text(f"{i+1}. {s['name'].split(',')[0][:20]}{time_str}")
                    if c2.button("🗑️", key=f"d{i}"):
                        st.session_state.stops_data.pop(i)
                        st.rerun()
                if len(st.session_state.stops_data) > 8:
                    st.caption(f"... and {len(st.session_state.stops_data) - 8} more stops.")
                if st.button("Clear All Stops", use_container_width=True):
                    st.session_state.stops_data = []
                    st.rerun()

        # --- Group 2: Optimization Mode & Constraints ---
        with st.expander("⚙️ Solver & Logistics Parameters", expanded=True):
            algo = st.selectbox(
                "Optimization Algorithm", 
                ["QPSO", "Simulated Annealing", "Genetic Algorithm", "Ant Colony", "Classical PSO", "Exact Solver"],
                help="Quantum-Inspired Particle Swarm vs Classical Metaheuristics & Exact Solvers"
            )
            st.session_state.algorithm_choice = algo
            
            fleet_size = st.slider("Fleet Size (Vehicles)", 1, 6, 1)
            capacity = st.number_input("Vehicle Capacity (max demand/vehicle, 0=unlimited)", min_value=0, value=0)
            st.session_state.vehicle_capacity = capacity
            is_round_trip = st.toggle("Return to Start Hub (Round Trip)", value=False)
            
            st.markdown("---")
            st.caption("Fleet Cost Coefficients")
            col1, col2 = st.columns(2)
            mileage = col1.number_input("Fuel Econ (Km/L)", value=12.0)
            fuel_price = col2.number_input("Fuel Price (₹/L)", value=96.0)

        # --- Group 3: Real-Time Traffic Congestion ---
        with st.expander("🚦 Dynamic Traffic Congestion", expanded=False):
            traffic_on = st.toggle("Enable Traffic Multipliers θ(t)", value=True)
            st.session_state.traffic_enabled = traffic_on
            if traffic_on:
                hour = st.slider("Departure Time (Hour of Day)", 0.0, 23.5, 9.0, step=0.5,
                                 help="Peak hours: Morning (8:00 - 10:00) & Evening (17:00 - 19:30)")
                st.session_state.traffic_hour = hour
                if (8.0 <= hour <= 10.0 or 17.0 <= hour <= 19.5):
                    st.warning("🔴 Peak Rush Hour: Congestion multiplier ~ 1.7x - 1.8x")
                elif 12.0 <= hour <= 15.0:
                    st.info("🟠 Moderate Traffic: Congestion multiplier ~ 1.25x")
                else:
                    st.success("🟢 Off-Peak Free Flow: Congestion multiplier ~ 1.0x")

        # --- Group 4: Advanced Algorithm Hyperparameters ---
        with st.expander("⚛️ Advanced Algorithm Parameters", expanded=False):
            if algo == "QPSO":
                swarm_size = st.slider("Swarm Size (Particles)", 10, 200, 50, help="Quantum particle count")
                beta = st.slider("Contraction-Expansion Coeff (β)", 0.4, 1.6, 1.2, format="%.2f", help="Exploration/Exploitation control")
                max_iter = st.slider("Max Quantum Iterations", 50, 3000, 600)
                q_params = {"swarm_size": swarm_size, "beta": beta, "max_iter": max_iter}
            elif algo == "Simulated Annealing":
                q_iter = st.slider("Iterations", 500, 5000, 2500)
                q_cool = st.slider("Cooling Rate", 0.850, 0.999, 0.995, format="%.3f")
                q_temp = st.slider("Initial Temp", 10, 500, 100)
                q_params = {"iter": q_iter, "cool": q_cool, "temp": q_temp}
            elif algo == "Genetic Algorithm":
                pop_size = st.slider("Population Size", 20, 200, 50)
                generations = st.slider("Generations", 50, 2000, 500)
                crossover_rate = st.slider("Crossover Rate", 0.50, 1.00, 0.85, format="%.2f")
                mutation_rate = st.slider("Mutation Rate", 0.01, 0.50, 0.15, format="%.2f")
                q_params = {"pop_size": pop_size, "generations": generations, "crossover_rate": crossover_rate, "mutation_rate": mutation_rate}
            elif algo == "Ant Colony":
                num_ants = st.slider("Number of Ants", 5, 100, 25)
                iterations = st.slider("Foraging Cycles", 20, 500, 150)
                alpha = st.slider("Pheromone Weight (α)", 0.1, 5.0, 1.0, format="%.2f")
                beta_aco = st.slider("Heuristic Visibility Weight (β)", 0.1, 5.0, 2.0, format="%.2f")
                evap_rate = st.slider("Evaporation Rate (ρ)", 0.01, 0.99, 0.10, format="%.2f")
                q_params = {"num_ants": num_ants, "iterations": iterations, "alpha": alpha, "beta": beta_aco, "evaporation_rate": evap_rate}
            elif algo == "Classical PSO":
                swarm_size = st.slider("Swarm Size", 10, 200, 50)
                max_iter = st.slider("Max Iterations", 50, 2000, 500)
                w = st.slider("Inertia Weight (w)", 0.1, 1.0, 0.7, format="%.2f")
                c1 = st.slider("Cognitive Parameter (c1)", 0.5, 3.0, 1.5, format="%.2f")
                c2 = st.slider("Social Parameter (c2)", 0.5, 3.0, 1.5, format="%.2f")
                q_params = {"swarm_size": swarm_size, "max_iter": max_iter, "w": w, "c1": c1, "c2": c2}
            else:
                q_params = {}

        go_btn = st.button("🚀 RUN QUANTUM ROUTER", type="primary", use_container_width=True)
        st.markdown("<div style='text-align: center; color: #a0aab5; font-size: 11px; margin-top: 5px; font-family: Roboto; opacity: 0.8;'>Quantum-Inspired Metaheuristic Engine • Enterprise VRP</div>", unsafe_allow_html=True)
        
        return (
            page,
            start_loc, 
            is_round_trip, 
            mileage, 
            fuel_price, 
            fleet_size, 
            q_params, 
            go_btn
        )
