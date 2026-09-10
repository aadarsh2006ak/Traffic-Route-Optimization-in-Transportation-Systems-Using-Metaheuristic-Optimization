# frontend/components/map_view.py
import streamlit as st
import pandas as pd
import folium
from folium import Element, plugins
from streamlit_folium import st_folium

def render_optimizer_view():
    """Renders the Live Fleet Map, Metrics KPI Cards, Feasibility status, and CSV Download."""
    if not st.session_state.optimized_route:
        st.info("👈 Please configure your stops in the sidebar and click RUN to start.")
        return

    m = st.session_state.route_metrics
    d = st.session_state.optimized_route
    
    # 1. Top KPI Metric Cards
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Dist.", f"{m['dist']:.1f} km", help="Total driving distance for all vehicles.")
    c2.metric("Est. Time", f"{int(m['time']//60)}h {int(m['time']%60)}m", help="Total estimated driving time with traffic.")
    c3.metric("Fuel Consumption", f"{m['fuel']:.1f} L", help="Estimated fuel consumption based on vehicle mileage.")
    c4.metric("Operational Cost", f"₹ {m['cost']:,.0f}", help="Total fuel cost.")

    # Feasibility badge
    if "validation" in m:
        val = m["validation"]
        if val.get("is_feasible", True):
            st.caption("✅ **Feasible Solution**: All vehicle capacity & time window bounds satisfied.")
        else:
            st.caption(f"⚠️ **Capacity Warning**: {val.get('overloaded_vehicles', 0)} vehicle(s) exceeded capacity limits.")

    # Fleet Breakdown
    if 'vehicles' in m and len(m['vehicles']) > 1:
        st.markdown("##### 🚛 Multi-Vehicle Fleet Workload")
        v_cols = st.columns(len(m['vehicles']))
        for i, v_data in enumerate(m['vehicles']):
            with v_cols[i]:
                st.caption(f"Vehicle {v_data['id']} ({v_data.get('stops', 0)} stops)")
                st.markdown(f"**{v_data['dist']:.1f} km** | {int(v_data['time'])}m")

    st.markdown("---")
    
    # --- MAP CONTROLS & HEADER ---
    c_head, c_tog = st.columns([0.5, 0.5])
    with c_head:
        st.markdown("""
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(0, 243, 255, 0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(0, 243, 255, 0.3);">
                <span style="font-size: 20px;">🛰️</span>
            </div>
            <div>
                <div style="font-family: 'Orbitron'; font-weight: 700; color: #00f3ff; font-size: 16px; letter-spacing: 1px;">LIVE FLEET DISPATCH</div>
                <div style="font-family: 'Roboto'; font-size: 11px; color: #a0aab5; font-weight: 500;">QUANTUM-INSPIRED GEOSPATIAL INTELLIGENCE</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with c_tog:
        t1, t2, t3 = st.columns(3)
        with t1: show_markers = st.toggle("📍 Markers", True)
        with t2: show_routes = st.toggle("🛣️ Routes", True)
        with t3: show_split = st.toggle("🎨 Split", True, help="Color-code by vehicle")

    # --- FOLIUM MAP GENERATION ---
    map_obj = folium.Map(location=d['coords'][0], zoom_start=11, tiles="Cartodb Dark_Matter")
    
    sw = [min(p[0] for p in d['coords']), min(p[1] for p in d['coords'])]
    ne = [max(p[0] for p in d['coords']), max(p[1] for p in d['coords'])]
    map_obj.fit_bounds([sw, ne])
    
    colors = ["#00f3ff", "#ff9100", "#d500f9", "#00e676", "#ff2b2b"]
    
    # Draw Routes
    if show_routes:
        for idx, route_geo in enumerate(d['routes_geo']):
            if st.session_state.get('traffic_enabled', False):
                hour = st.session_state.get('traffic_hour', 9.0)
                is_peak = (8.0 <= hour <= 10.0 or 17.0 <= hour <= 19.5)
                color = "#ff2b2b" if is_peak else colors[idx % len(colors)] if show_split else "#00f3ff"
            else:
                color = colors[idx % len(colors)] if show_split else "#00f3ff"
            
            line = folium.PolyLine(
                route_geo, color=color, weight=4, opacity=0.85, tooltip=f"Vehicle {idx+1} Tour"
            ).add_to(map_obj)
            
            plugins.PolyLineTextPath(
                line, "      ➤      ", repeat=True, offset=6,
                attributes={'fill': color, 'font-weight': 'bold', 'font-size': '18'}
            ).add_to(map_obj)
    
    # Draw Markers
    if show_markers:
        for m_item in d['markers']:
            v_id = m_item['vehicle_id']
            color = colors[v_id % len(colors)] if show_split else "#00f3ff"
            
            if m_item['stop_idx'] == 0:
                icon = folium.Icon(color="green", icon="play")
                popup = f"Vehicle {v_id+1}: Start Hub"
            elif m_item['is_last']:
                icon = folium.Icon(color="red", icon="flag")
                popup = f"Vehicle {v_id+1}: End Location"
            else:
                icon = plugins.BeautifyIcon(
                    number=m_item['stop_idx'], border_color=color, background_color=color,
                    text_color="white", icon_shape="marker"
                )
                popup = f"Vehicle {v_id+1}: Stop #{m_item['stop_idx']}"
                if m_item.get('window'):
                    popup += f" (🕒 {m_item['window'][0]:.0f}-{m_item['window'][1]:.0f}h)"
            
            folium.Marker(m_item['coords'], tooltip=popup, popup=m_item['name'], icon=icon).add_to(map_obj)
    
    # Glassmorphic Legend Card
    if show_split and (show_routes or show_markers):
        legend_items = ""
        for i in range(len(d['routes_geo'])):
            c = colors[i % len(colors)]
            legend_items += f'''
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <span style="background:{c}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:8px; box-shadow: 0 0 8px {c};"></span>
                <span style="color: #e0e6ed; font-size: 12px; font-weight: 500;">Vehicle {i+1}</span>
                <span style="margin-left: auto; color: #00f3ff; font-size: 9px; border: 1px solid rgba(0, 243, 255, 0.3); padding: 2px 6px; border-radius: 4px; background: rgba(0, 243, 255, 0.05);">ACTIVE</span>
            </div>
            '''
            
        legend_html = f'''
            <div style="
                position: fixed; top: 20px; right: 20px; width: 180px;
                background: rgba(10, 12, 20, 0.88); backdrop-filter: blur(16px);
                border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 12px;
                padding: 12px; z-index: 9999; font-family: 'Roboto', sans-serif;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                ">
                <div style="font-family: 'Orbitron'; font-size: 11px; color: #a0aab5; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 5px; letter-spacing: 1px;">
                    FLEET DISPATCH
                </div>
                {legend_items}
            </div>
            '''
        map_obj.get_root().html.add_child(Element(legend_html))
        
    st_folium(map_obj, width="100%", height=520)
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Download Route Manifest CSV
    export_data = []
    for marker in d['markers']:
        export_data.append({
            "Vehicle ID": f"Vehicle {marker['vehicle_id'] + 1}",
            "Stop Sequence": marker['stop_idx'],
            "Location Name": marker['name'],
            "Latitude": marker['coords'][0],
            "Longitude": marker['coords'][1],
            "Time Window": f"{marker['window'][0]}-{marker['window'][1]}h" if marker.get('window') else "Unconstrained"
        })
    
    df_export = pd.DataFrame(export_data)
    csv_data = df_export.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Route Manifest (CSV)",
        data=csv_data,
        file_name="quantum_route_manifest.csv",
        mime="text/csv",
        use_container_width=True
    )
