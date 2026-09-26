# backend/app/graph/graph_builder.py
import math
import random
import numpy as np
import networkx as nx
from typing import List, Dict, Any, Tuple, Optional
from .traffic_simulator import traffic_simulator

class GraphBuilder:
    """
    Constructs and manages transportation road network graphs using NetworkX and OSMnx.
    Supports real-world OpenStreetMap city graphs and synthetic benchmark topologies.
    """
    def __init__(self):
        self.cached_graphs: Dict[str, nx.DiGraph] = {}
        self.cached_metadata: Dict[str, Dict[str, Any]] = {}

    def build_from_nodes(
        self,
        nodes: List[Dict[str, Any]],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        traffic_hour: float = 9.0,
        alpha: float = 0.4,
        beta: float = 0.4,
        gamma: float = 0.2
    ) -> nx.DiGraph:
        """
        Builds a NetworkX DiGraph from a given list of location nodes and distance/time matrices.
        Edge weights computed using composite formulation: w(i, j, t) = alpha*d + beta*t + gamma*cong
        """
        G = nx.DiGraph()
        n = len(nodes)

        # 1. Add Nodes
        for i, node in enumerate(nodes):
            G.add_node(
                i,
                name=node.get("name", f"Node_{i}"),
                coords=node.get("coords", (0.0, 0.0)),
                demand=node.get("demand", 1.0),
                window=node.get("window", None),
                service_time=node.get("service_time", 0.15),
                is_depot=(i == 0)
            )

        # 2. Add Weighted Directed Edges
        cong_multiplier = traffic_simulator.get_congestion_factor(traffic_hour)
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist_km = float(dist_matrix[i][j])
                    base_time_hr = float(time_matrix[i][j])
                    dyn_time_hr = base_time_hr * cong_multiplier
                    
                    # w(i, j, t) = alpha * distance + beta * travel_time_hours*50 + gamma * congestion_delay_hours*50
                    weight = traffic_simulator.compute_edge_weight(
                        dist_km=dist_km,
                        travel_time_hr=dyn_time_hr,
                        cong_multiplier=cong_multiplier,
                        alpha=alpha,
                        beta=beta,
                        gamma=gamma
                    )

                    G.add_edge(
                        i,
                        j,
                        distance_km=round(dist_km, 3),
                        base_time_hr=round(base_time_hr, 3),
                        effective_time_hr=round(dyn_time_hr, 3),
                        congestion_factor=round(cong_multiplier, 2),
                        weight=round(weight, 3)
                    )

        return G

    def generate_synthetic_graph(
        self,
        node_count: int = 20,
        center_lat: float = 28.6139,
        center_lon: float = 77.2090,
        radius_km: float = 15.0,
        traffic_hour: float = 9.0
    ) -> Tuple[List[Dict[str, Any]], np.ndarray, np.ndarray, nx.DiGraph]:
        """
        Generates a synthetic road network with coordinates, random demands, and realistic Euclidean distances.
        """
        random.seed(42 + node_count)
        np.random.seed(42 + node_count)

        nodes = []
        # Node 0: Central Depot
        nodes.append({
            "name": "Central Depot (HQ)",
            "coords": (center_lat, center_lon),
            "demand": 0.0,
            "window": (8.0, 20.0),
            "service_time": 0.0
        })

        # Customer Stops
        for i in range(1, node_count):
            angle = random.uniform(0, 2 * math.pi)
            r = math.sqrt(random.uniform(0.1, 1.0)) * radius_km
            d_lat = (r / 111.0) * math.cos(angle)
            d_lon = (r / (111.0 * math.cos(math.radians(center_lat)))) * math.sin(angle)
            
            demand = round(random.uniform(1.0, 5.0), 1)
            e_window = round(random.uniform(8.5, 14.0), 1)
            l_window = round(e_window + random.uniform(2.0, 5.0), 1)

            nodes.append({
                "name": f"Delivery Hub #{i:02d}",
                "coords": (round(center_lat + d_lat, 5), round(center_lon + d_lon, 5)),
                "demand": demand,
                "window": (e_window, l_window),
                "service_time": 0.15
            })

        # Generate Distance & Time Matrices
        n = len(nodes)
        dist_matrix = np.zeros((n, n), dtype=float)
        time_matrix = np.zeros((n, n), dtype=float)

        for i in range(n):
            lat1, lon1 = nodes[i]["coords"]
            for j in range(n):
                if i != j:
                    lat2, lon2 = nodes[j]["coords"]
                    # Haversine distance
                    dlat = math.radians(lat2 - lat1)
                    dlon = math.radians(lon2 - lon1)
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    km = 6371.0 * c * 1.35 # Urban circuity factor
                    dist_matrix[i][j] = km
                    # Base speed 40 km/h
                    time_matrix[i][j] = km / 40.0

        graph = self.build_from_nodes(nodes, dist_matrix, time_matrix, traffic_hour=traffic_hour)
        return nodes, dist_matrix, time_matrix, graph

    def load_osmnx_city_graph(
        self,
        place_name: str = "Delhi, India",
        node_sample_limit: int = 30,
        traffic_hour: float = 9.0
    ) -> Tuple[List[Dict[str, Any]], np.ndarray, np.ndarray, nx.DiGraph]:
        """
        Pulls real city road network data using OSMnx (with fallback to synthetic city coordinates if offline).
        """
        try:
            import osmnx as ox
            # Attempt live OSMnx fetch
            G_osm = ox.graph_from_place(place_name, network_type="drive", simplify=True)
            sampled_nodes_keys = list(G_osm.nodes)[:node_sample_limit]
            
            nodes = []
            nodes.append({
                "name": f"{place_name} Central Hub",
                "coords": (float(G_osm.nodes[sampled_nodes_keys[0]]["y"]), float(G_osm.nodes[sampled_nodes_keys[0]]["x"])),
                "demand": 0.0,
                "window": (8.0, 20.0),
                "service_time": 0.0
            })

            for idx, k in enumerate(sampled_nodes_keys[1:], 1):
                y = float(G_osm.nodes[k]["y"])
                x = float(G_osm.nodes[k]["x"])
                nodes.append({
                    "name": f"{place_name} Node #{idx:02d}",
                    "coords": (round(y, 5), round(x, 5)),
                    "demand": round(random.uniform(1.0, 4.0), 1),
                    "window": (9.0, 17.0),
                    "service_time": 0.15
                })

            n = len(nodes)
            dist_matrix = np.zeros((n, n))
            time_matrix = np.zeros((n, n))
            for i in range(n):
                for j in range(n):
                    if i != j:
                        try:
                            l = nx.shortest_path_length(G_osm, sampled_nodes_keys[i], sampled_nodes_keys[j], weight="length")
                            km = float(l) / 1000.0
                        except Exception:
                            # Euclidean fallback
                            lat1, lon1 = nodes[i]["coords"]
                            lat2, lon2 = nodes[j]["coords"]
                            km = math.hypot(lat2 - lat1, lon2 - lon1) * 111.0
                        dist_matrix[i][j] = km
                        time_matrix[i][j] = km / 35.0

            graph = self.build_from_nodes(nodes, dist_matrix, time_matrix, traffic_hour=traffic_hour)
            return nodes, dist_matrix, time_matrix, graph

        except Exception:
            # High-fidelity realistic city coordinates fallback
            city_coords = {
                "Delhi, India": (28.6139, 77.2090),
                "Mumbai, India": (19.0760, 72.8777),
                "Bengaluru, India": (12.9716, 77.5946),
                "Pune, India": (18.5204, 73.8567),
            }
            lat, lon = city_coords.get(place_name, (28.6139, 77.2090))
            return self.generate_synthetic_graph(
                node_count=node_sample_limit,
                center_lat=lat,
                center_lon=lon,
                radius_km=12.0,
                traffic_hour=traffic_hour
            )

    def get_graph_analytics(self, graph: nx.DiGraph) -> Dict[str, Any]:
        """
        Computes topological network metrics: Density, Clustering, Degree & Betweenness centrality.
        """
        if graph.number_of_nodes() == 0:
            return {"num_nodes": 0, "num_edges": 0}

        try:
            deg_centrality = nx.degree_centrality(graph)
            betweenness = nx.betweenness_centrality(graph, weight="weight")
            density = nx.density(graph)
            avg_clustering = nx.average_clustering(graph.to_undirected())
        except Exception:
            deg_centrality, betweenness, density, avg_clustering = {}, {}, 0.0, 0.0

        return {
            "num_nodes": graph.number_of_nodes(),
            "num_edges": graph.number_of_edges(),
            "graph_density": round(float(density), 4),
            "avg_clustering_coeff": round(float(avg_clustering), 4),
            "degree_centrality": {str(k): round(float(v), 4) for k, v in deg_centrality.items()},
            "betweenness_centrality": {str(k): round(float(v), 4) for k, v in betweenness.items()}
        }

graph_builder = GraphBuilder()
