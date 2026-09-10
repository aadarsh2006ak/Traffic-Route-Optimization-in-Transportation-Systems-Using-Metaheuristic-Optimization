# frontend/components/graph_view.py
import streamlit as st
import pandas as pd
from ..api_client import api_client

def render_graph_view():
    """Renders the NetworkX Weighted Graph Topology and Network Analytics."""
    st.markdown("### 🕸️ Abstract Transportation Network Graph (NetworkX)")
    st.caption("Directed weighted graph representation $G = (V, E, W)$ with time-dependent congestion edge weights.")

    if not st.session_state.stops_data:
        st.info("👈 Please load or search for stops in the Route Optimizer sidebar to build the network graph.")
        return

    # Hub + Stops
    start_loc = st.session_state.get("start_loc") or {
        "name": "Central Hub",
        "coords": st.session_state.stops_data[0]["coords"]
    }
    all_nodes = [start_loc] + st.session_state.stops_data
    traffic_hour = st.session_state.get("traffic_hour", 9.0)

    # Routes to highlight
    routes_to_show = None
    if st.session_state.optimized_route and "raw_routes" in st.session_state.optimized_route:
        routes_to_show = st.session_state.optimized_route["raw_routes"]

    dot_str, analytics = api_client.build_network_graph(all_nodes, routes=routes_to_show, traffic_hour=traffic_hour)

    # 1. Graph Metrics KPIs
    g1, g2, g3, g4 = st.columns(4)
    g1.metric("Total Nodes (|V|)", analytics.get("num_nodes", len(all_nodes)))
    g2.metric("Directed Edges (|E|)", analytics.get("num_edges", 0))
    g3.metric("Graph Density", f"{analytics.get('graph_density', 0.0):.3f}")
    g4.metric("Clustering Coeff.", f"{analytics.get('avg_clustering_coeff', 0.0):.3f}")

    st.markdown("---")

    # 2. Graphviz Rendering
    st.markdown("#### 🗺️ Interactive Network Topology Graph")
    st.graphviz_chart(dot_str, use_container_width=True)

    # 3. Centrality Table
    if "degree_centrality" in analytics and analytics["degree_centrality"]:
        st.markdown("#### 📍 Node Centrality & Hub Importance")
        rows = []
        for idx_str, deg in analytics["degree_centrality"].items():
            idx = int(idx_str)
            if idx < len(all_nodes):
                name = all_nodes[idx]["name"]
                betw = analytics.get("betweenness_centrality", {}).get(idx_str, 0.0)
                rows.append({
                    "Node Index": idx,
                    "Location Name": name,
                    "Degree Centrality": deg,
                    "Betweenness Centrality": betw
                })
        df_centrality = pd.DataFrame(rows)
        st.dataframe(df_centrality, use_container_width=True)
