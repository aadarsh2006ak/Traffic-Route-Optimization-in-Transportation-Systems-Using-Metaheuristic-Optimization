# backend/app/core/graph_model.py
from typing import List, Dict, Any, Optional
import networkx as nx
import numpy as np
from .traffic_sim import traffic_sim

class TransportationGraph:
    """
    Formal NetworkX Directed Weighted Graph (DiGraph) representation of the transportation network.
    """
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph(
        self,
        nodes: List[Dict[str, Any]],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        traffic_hour: float = 9.0
    ) -> nx.DiGraph:
        """
        Populates NetworkX graph with nodes, coordinates, and dynamic traffic weighted edges.
        """
        self.graph.clear()
        n = len(nodes)

        # 1. Add Nodes
        for i, node in enumerate(nodes):
            self.graph.add_node(
                i,
                name=node.get("name", f"Node_{i}"),
                coords=node.get("coords", (0.0, 0.0)),
                demand=node.get("demand", 1.0),
                window=node.get("window", None),
                is_depot=(i == 0)
            )

        # 2. Add Directed Weighted Edges
        cong_factor = traffic_sim.get_congestion_factor(traffic_hour)
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist_km = float(dist_matrix[i][j])
                    base_time_h = float(time_matrix[i][j])
                    dyn_time_h = base_time_h * cong_factor
                    
                    # Composite edge weight: Distance + Travel Time Cost
                    weight = dist_km + (dyn_time_h * 40.0)

                    self.graph.add_edge(
                        i,
                        j,
                        distance_km=round(dist_km, 2),
                        base_time_hr=round(base_time_h, 3),
                        effective_time_hr=round(dyn_time_h, 3),
                        congestion_factor=round(cong_factor, 2),
                        weight=round(weight, 3)
                    )

        return self.graph

    def get_graph_analytics(self) -> Dict[str, Any]:
        """
        Extracts structural and topological metrics of the road network.
        """
        if len(self.graph.nodes) == 0:
            return {"nodes": 0, "edges": 0}

        try:
            deg_centrality = nx.degree_centrality(self.graph)
            betweenness = nx.betweenness_centrality(self.graph, weight="weight")
            density = nx.density(self.graph)
            avg_clustering = nx.average_clustering(self.graph.to_undirected())
        except Exception:
            deg_centrality, betweenness, density, avg_clustering = {}, {}, 0.0, 0.0

        return {
            "num_nodes": self.graph.number_of_nodes(),
            "num_edges": self.graph.number_of_edges(),
            "graph_density": round(density, 4),
            "avg_clustering_coeff": round(avg_clustering, 4),
            "degree_centrality": {str(k): round(v, 4) for k, v in deg_centrality.items()},
            "betweenness_centrality": {str(k): round(v, 4) for k, v in betweenness.items()}
        }

    def generate_graphviz_dot(
        self,
        nodes: List[Dict[str, Any]],
        routes: Optional[List[List[Dict[str, Any]]]] = None,
        traffic_hour: float = 9.0
    ) -> str:
        """
        Generates Graphviz DOT string with cyberpunk styling and route-highlighted edges.
        """
        dot_lines = [
            'digraph G {',
            '    rankdir=LR;',
            '    bgcolor="transparent";',
            '    node [shape=box, style="filled,rounded", fillcolor="#111827", fontcolor="#ffffff", color="#00f3ff", fontname="Roboto", penwidth=1.5];',
            '    edge [color="#374151", fontcolor="#9ca3af", fontname="Roboto", fontsize=9];'
        ]

        # Render Nodes
        for i, stop in enumerate(nodes):
            label = stop["name"].split(",")[0].replace('"', '')
            if i == 0:
                dot_lines.append(f'    node_{i} [label="🏢 HUB: {label}", color="#00e676", fillcolor="#064e3b", penwidth=2.5];')
            else:
                window_str = f"\\n🕒 {stop['window'][0]:.0f}-{stop['window'][1]:.0f}h" if "window" in stop and stop["window"] else ""
                dot_lines.append(f'    node_{i} [label="{i}. {label}{window_str}"];')

        colors = ["#00f3ff", "#ff9100", "#d500f9", "#00e676", "#ff2b2b"]

        if routes:
            # Highlight actual vehicle tours
            for v_idx, route in enumerate(routes):
                v_color = colors[v_idx % len(colors)]
                for step in range(len(route) - 1):
                    src_name = route[step]["name"]
                    dst_name = route[step + 1]["name"]

                    src_idx = next((k for k, n in enumerate(nodes) if n["name"] == src_name), None)
                    dst_idx = next((k for k, n in enumerate(nodes) if n["name"] == dst_name), None)

                    if src_idx is not None and dst_idx is not None:
                        dot_lines.append(
                            f'    node_{src_idx} -> node_{dst_idx} [color="{v_color}", penwidth=2.8, label=" V{v_idx+1}:Leg {step+1}", fontcolor="{v_color}"];'
                        )
        else:
            # Draw sample mesh
            max_preview = min(len(nodes), 8)
            for i in range(max_preview - 1):
                dot_lines.append(f'    node_{i} -> node_{i+1} [style=dashed, label="connected"];')

        dot_lines.append('}')
        return "\n".join(dot_lines)

transportation_graph = TransportationGraph()
