# backend/app/algorithms/classical_pso.py
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler

class ClassicalPSOSolver:
    """
    Classical Particle Swarm Optimization (PSO) using Newtonian mechanics.
    """
    def __init__(
        self,
        swarm_size: int = 40,
        max_iter: int = 600,
        w: float = 0.7,
        c1: float = 1.5,
        c2: float = 1.5,
        v_max: float = 4.0
    ):
        self.swarm_size = swarm_size
        self.max_iter = max_iter
        self.w = w
        self.c1 = c1
        self.c2 = c2
        self.v_max = v_max

    def _decode_keys_to_permutation(self, keys: np.ndarray, dim: int) -> List[int]:
        order = np.argsort(keys) + 1
        return [0] + order.tolist()

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
        for k in ["pso_params", "q_params"]:
            if k in kwargs and kwargs[k]:
                merged_params.update(kwargs[k])

        swarm_size = int(merged_params.get("swarm_size", self.swarm_size))
        max_iter = int(merged_params.get("max_iter", self.max_iter))
        w = float(merged_params.get("w", self.w))
        c1 = float(merged_params.get("c1", self.c1))
        c2 = float(merged_params.get("c2", self.c2))

        dim = n - 1

        X = np.random.uniform(-10.0, 10.0, size=(swarm_size, dim))
        V = np.random.uniform(-self.v_max, self.v_max, size=(swarm_size, dim))
        P = np.copy(X)
        P_fit = np.full(swarm_size, np.inf)

        for i in range(swarm_size):
            perm = self._decode_keys_to_permutation(X[i], dim)
            cost, _ = constraint_handler.evaluate_route_fitness(
                perm, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            P_fit[i] = cost

        g_idx = np.argmin(P_fit)
        G = np.copy(P[g_idx])
        G_fit = P_fit[g_idx]
        best_permutation = self._decode_keys_to_permutation(G, dim)

        history = [float(G_fit)]

        for it in range(1, max_iter + 1):
            for i in range(swarm_size):
                r1 = np.random.uniform(0.0, 1.0, size=dim)
                r2 = np.random.uniform(0.0, 1.0, size=dim)

                V[i] = w * V[i] + c1 * r1 * (P[i] - X[i]) + c2 * r2 * (G - X[i])
                V[i] = np.clip(V[i], -self.v_max, self.v_max)
                X[i] = X[i] + V[i]

                perm = self._decode_keys_to_permutation(X[i], dim)
                cost, _ = constraint_handler.evaluate_route_fitness(
                    perm, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )

                if cost < P_fit[i]:
                    P[i] = np.copy(X[i])
                    P_fit[i] = cost
                    if cost < G_fit:
                        G = np.copy(X[i])
                        G_fit = cost
                        best_permutation = perm

            history.append(float(G_fit))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[idx] for idx in best_permutation]
        return ordered_nodes, {
            "algorithm": "Classical PSO",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(G_fit), 2),
            "iterations": max_iter,
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
            "algorithm": "Classical PSO",
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

classical_pso_solver = ClassicalPSOSolver()
