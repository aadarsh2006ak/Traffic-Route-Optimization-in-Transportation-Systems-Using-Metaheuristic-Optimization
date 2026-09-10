# backend/app/algorithms/ant_colony.py
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler
# pyrefly: ignore [missing-import]
from ..core.traffic_sim import traffic_sim

class AntColonySolver:
    """
    Ant Colony Optimization (ACO) for Vehicle Routing & TSP.
    """
    def __init__(
        self,
        num_ants: int = 25,
        iterations: int = 150,
        alpha: float = 1.0,
        beta: float = 2.0,
        evaporation_rate: float = 0.1,
        q_pheromone: float = 100.0
    ):
        self.num_ants = num_ants
        self.iterations = iterations
        self.alpha = alpha
        self.beta = beta
        self.evaporation_rate = evaporation_rate
        self.q_pheromone = q_pheromone

    def solve_single_tour(
        self,
        nodes: List[Dict[str, Any]],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        start_hour: float = 8.0,
        vehicle_capacity: int = 0,
        traffic_enabled: bool = True,
        params: Dict[str, Any] = None,
        **kwargs
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        t_start = time.time()
        n = len(nodes)
        if n <= 2:
            return nodes, {"history": [0.0], "runtime": 0.0, "tunnels": 0, "iterations": 1}

        merged_params = {}
        if params: merged_params.update(params)
        for k in ["aco_params", "q_params"]:
            if k in kwargs and kwargs[k]:
                merged_params.update(kwargs[k])

        num_ants = int(merged_params.get("num_ants", self.num_ants))
        iterations = int(merged_params.get("iterations", self.iterations))
        alpha = float(merged_params.get("alpha", self.alpha))
        beta = float(merged_params.get("beta", self.beta))
        rho = float(merged_params.get("evaporation_rate", self.evaporation_rate))
        q_ph = self.q_pheromone

        cong_factor = traffic_sim.get_congestion_factor(start_hour) if traffic_enabled else 1.0
        eta = np.zeros((n, n))
        for i in range(n):
            for j in range(n):
                if i != j:
                    effective_d = dist_matrix[i][j] * (1.0 + 0.3 * (cong_factor - 1.0))
                    eta[i][j] = 1.0 / max(effective_d, 0.01)

        tau = np.ones((n, n)) * 1.0
        best_route = None
        best_cost = np.inf
        history = []

        for it in range(iterations):
            all_ant_routes = []
            all_ant_costs = []

            for ant in range(num_ants):
                visited = [0]
                unvisited = set(range(1, n))
                curr = 0

                while unvisited:
                    probs = []
                    unvisited_list = list(unvisited)
                    for nxt in unvisited_list:
                        p = (tau[curr][nxt] ** alpha) * (eta[curr][nxt] ** beta)
                        probs.append(p)

                    total_p = sum(probs)
                    if total_p == 0:
                        probs = [1.0 / len(unvisited_list)] * len(unvisited_list)
                    else:
                        probs = [p / total_p for p in probs]

                    chosen = np.random.choice(unvisited_list, p=probs)
                    visited.append(chosen)
                    unvisited.remove(chosen)
                    curr = chosen

                cost, _ = constraint_handler.evaluate_route_fitness(
                    visited, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )
                all_ant_routes.append(visited)
                all_ant_costs.append(cost)

                if cost < best_cost:
                    best_cost = cost
                    best_route = visited[:]

            tau = (1.0 - rho) * tau
            iter_best_idx = np.argmin(all_ant_costs)
            iter_best_route = all_ant_routes[iter_best_idx]
            delta_tau = q_ph / max(all_ant_costs[iter_best_idx], 1.0)

            for i in range(len(iter_best_route) - 1):
                u, v = iter_best_route[i], iter_best_route[i+1]
                tau[u][v] += delta_tau
                tau[v][u] += delta_tau

            history.append(float(best_cost))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_route] if best_route else nodes
        return ordered_nodes, {
            "algorithm": "Ant Colony",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_cost), 2),
            "iterations": iterations,
            "runtime": round(t_elapsed, 4)
        }

    def solve(
        self,
        start_node: Dict[str, Any],
        stops_data: List[Dict[str, Any]],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        n_vehicles: int = 1,
        vehicle_capacity: int = 0,
        traffic_hour: float = 9.0,
        traffic_enabled: bool = True,
        params: Dict[str, Any] = None,
        **kwargs
    ) -> Tuple[List[List[Dict[str, Any]]], Dict[str, Any]]:
        all_nodes = [start_node] + stops_data
        if n_vehicles == 1 or len(stops_data) <= 1:
            r, s = self.solve_single_tour(
                all_nodes, dist_matrix, time_matrix, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
            )
            return [r], s

        coords = np.array([[s['coords'][0], s['coords'][1]] for s in stops_data])
        k = min(n_vehicles, len(stops_data))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10).fit(coords)

        clusters = {i: [] for i in range(k)}
        for idx, label in enumerate(kmeans.labels_):
            clusters[label].append(stops_data[idx])

        routes = []
        combined_stats = {
            "algorithm": "Ant Colony",
            "history": [],
            "tunnels": 0,
            "runtime": 0.0,
            "iterations": 0
        }

        for label, sub_stops in clusters.items():
            if not sub_stops: continue
            sub_nodes = [start_node] + sub_stops
            node_indices = [0] + [stops_data.index(s) + 1 for s in sub_stops]
            sub_dist = dist_matrix[np.ix_(node_indices, node_indices)]
            sub_time = time_matrix[np.ix_(node_indices, node_indices)]

            r, s = self.solve_single_tour(
                sub_nodes, sub_dist, sub_time, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
            )
            routes.append(r)
            combined_stats["runtime"] += s["runtime"]
            combined_stats["iterations"] = max(combined_stats["iterations"], s["iterations"])
            if not combined_stats["history"]:
                combined_stats["history"] = s["history"]
            else:
                combined_stats["history"] = [
                    h + s["history"][min(idx, len(s["history"]) - 1)]
                    for idx, h in enumerate(combined_stats["history"])
                ]

        return routes, combined_stats

aco_solver = AntColonySolver()
