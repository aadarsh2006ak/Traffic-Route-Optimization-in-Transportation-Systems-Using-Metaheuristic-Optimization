# backend/app/optimizers/ant_colony.py
import time
import random
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
from ..core.constraints import constraint_handler

class AntColonySolver:
    """
    Ant Colony Optimization (ACO) baseline for VRP & TSP.
    Pheromone probability transition: P_ij = [tau_ij]^alpha * [eta_ij]^beta / sum([tau_ik]^alpha * [eta_ik]^beta)
    Pheromone evaporation: tau_ij = (1 - rho) * tau_ij + sum(Delta tau_ij^k)
    """
    def __init__(
        self,
        num_ants: int = 25,
        max_iter: int = 200,
        alpha: float = 1.0,
        beta: float = 2.5,
        rho: float = 0.1,
        q: float = 100.0
    ):
        self.num_ants = num_ants
        self.max_iter = max_iter
        self.alpha = alpha
        self.beta = beta
        self.rho = rho
        self.q = q

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
        if n <= 1:
            return nodes, {"history": [0.0], "runtime": 0.0, "tunnels": 0, "iterations": 0}
        if n == 2:
            cost, _ = constraint_handler.evaluate_route_fitness(
                [0, 1], dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            return nodes, {"history": [cost], "runtime": 0.001, "tunnels": 0, "iterations": 1}

        merged = {}
        if params: merged.update(params)
        num_ants = int(merged.get("num_ants", self.num_ants))
        max_iter = int(merged.get("max_iter", self.max_iter))
        alpha = float(merged.get("alpha", self.alpha))
        beta = float(merged.get("beta", self.beta))
        rho = float(merged.get("rho", self.rho))
        q = float(merged.get("q", self.q))

        # Initialize Visibility Matrix eta = 1 / (d + eps)
        eta = np.zeros((n, n))
        for i in range(n):
            for j in range(n):
                if i != j:
                    eta[i][j] = 1.0 / max(dist_matrix[i][j], 0.01)

        # Initialize Pheromone Matrix tau
        tau = np.ones((n, n)) * 0.1

        best_route = None
        best_cost = np.inf
        history = []

        for it in range(max_iter):
            all_ant_routes = []
            all_ant_costs = []

            for _ in range(num_ants):
                route = [0]
                unvisited = set(range(1, n))
                curr = 0

                while unvisited:
                    unvisited_list = list(unvisited)
                    probs = []
                    for nxt in unvisited_list:
                        p = (tau[curr][nxt] ** alpha) * (eta[curr][nxt] ** beta)
                        probs.append(p)

                    sum_p = sum(probs)
                    if sum_p == 0:
                        probs = [1.0 / len(unvisited_list)] * len(unvisited_list)
                    else:
                        probs = [p / sum_p for p in probs]

                    nxt_node = np.random.choice(unvisited_list, p=probs)
                    route.append(nxt_node)
                    unvisited.remove(nxt_node)
                    curr = nxt_node

                cost, _ = constraint_handler.evaluate_route_fitness(
                    route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )
                all_ant_routes.append(route)
                all_ant_costs.append(cost)

                if cost < best_cost:
                    best_cost = cost
                    best_route = route[:]

            # Evaporation
            tau = (1.0 - rho) * tau

            # Deposit pheromone
            for r, c in zip(all_ant_routes, all_ant_costs):
                delta = q / max(c, 1e-4)
                for idx in range(len(r) - 1):
                    u, v = r[idx], r[idx+1]
                    tau[u][v] += delta
                    tau[v][u] += delta

            history.append(float(best_cost))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_route] if best_route else nodes

        stats = {
            "algorithm": "Ant Colony",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_cost), 2),
            "iterations": max_iter,
            "runtime": round(t_elapsed, 4)
        }
        return ordered_nodes, stats

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
        if n_vehicles <= 1 or len(stops_data) <= 1:
            route, stats = self.solve_single_tour(
                all_nodes, dist_matrix, time_matrix, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
            )
            return [route], stats

        coords = np.array([[s["coords"][0], s["coords"][1]] for s in stops_data])
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
            if not sub_stops:
                continue
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

ant_colony_solver = AntColonySolver()
