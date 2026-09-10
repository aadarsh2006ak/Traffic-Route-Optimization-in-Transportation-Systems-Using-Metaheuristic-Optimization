# backend/app/algorithms/qpso.py
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler

class QPSOSolver:
    """
    Quantum-Behaved Particle Swarm Optimization (QPSO) for Vehicle Routing & TSP.
    Based on the Delta Potential Well model in Quantum Mechanics:
    - Particles lack classical velocity and operate via wave function collapse.
    - Mean Best Position (mBest) governs global swarm guidance.
    - Contraction-Expansion coefficient (beta) controls exploration/exploitation.
    - Continuous positions mapped to discrete routes via Random-Key Encoding (RKE) + 2-Opt.
    """
    def __init__(
        self,
        swarm_size: int = 40,
        max_iter: int = 800,
        beta_max: float = 1.2,
        beta_min: float = 0.5,
        local_search_freq: int = 5
    ):
        self.swarm_size = swarm_size
        self.max_iter = max_iter
        self.beta_max = beta_max
        self.beta_min = beta_min
        self.local_search_freq = local_search_freq

    def _decode_keys_to_permutation(self, keys: np.ndarray, num_customers: int) -> List[int]:
        order = np.argsort(keys) + 1
        return [0] + order.tolist()

    def _apply_2opt(
        self,
        route: List[int],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        nodes: List[Dict[str, Any]],
        start_hour: float,
        capacity: int,
        traffic: bool
    ) -> Tuple[List[int], float]:
        best_r = route[:]
        best_cost, _ = constraint_handler.evaluate_route_fitness(
            best_r, dist_matrix, time_matrix, nodes, start_hour, capacity, traffic
        )
        n = len(route)
        if n < 4:
            return best_r, best_cost

        improved = True
        step = 0
        while improved and step < 25:
            improved = False
            step += 1
            for i in range(1, n - 1):
                for j in range(i + 1, n):
                    new_r = best_r[:]
                    new_r[i:j+1] = best_r[i:j+1][::-1]
                    cost, _ = constraint_handler.evaluate_route_fitness(
                        new_r, dist_matrix, time_matrix, nodes, start_hour, capacity, traffic
                    )
                    if cost < best_cost - 1e-4:
                        best_cost = cost
                        best_r = new_r
                        improved = True
                        break
                if improved:
                    break
        return best_r, best_cost

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
            return nodes, {"history": [dist_matrix[0][1]], "runtime": 0.0, "tunnels": 0, "iterations": 1}

        merged_params = {}
        if params: merged_params.update(params)
        for k in ["q_params", "qpso_params"]:
            if k in kwargs and kwargs[k]:
                merged_params.update(kwargs[k])

        swarm_size = int(merged_params.get("swarm_size", self.swarm_size))
        max_iter = int(merged_params.get("max_iter", self.max_iter))
        beta_max = float(merged_params.get("beta", self.beta_max))
        beta_min = self.beta_min

        dim = n - 1

        X = np.random.uniform(-10.0, 10.0, size=(swarm_size, dim))
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
        beta_history = []
        quantum_jumps = 0

        for it in range(1, max_iter + 1):
            beta = beta_max - (it / max_iter) * (beta_max - beta_min)
            beta_history.append(float(beta))

            mBest = np.mean(P, axis=0)

            for i in range(swarm_size):
                phi = np.random.uniform(0.0, 1.0, size=dim)
                p_attr = phi * P[i] + (1.0 - phi) * G

                u = np.random.uniform(0.0, 1.0, size=dim)
                u = np.clip(u, 1e-7, 1.0 - 1e-7)
                signs = np.random.choice([-1.0, 1.0], size=dim)

                step = beta * np.abs(mBest - X[i]) * np.log(1.0 / u)
                X[i] = p_attr + signs * step

                perm = self._decode_keys_to_permutation(X[i], dim)
                cost, _ = constraint_handler.evaluate_route_fitness(
                    perm, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )

                if cost < P_fit[i]:
                    P[i] = np.copy(X[i])
                    P_fit[i] = cost
                    quantum_jumps += 1

                    if cost < G_fit:
                        G = np.copy(X[i])
                        G_fit = cost
                        best_permutation = perm

            if it % self.local_search_freq == 0 or it == max_iter:
                polished_perm, polished_cost = self._apply_2opt(
                    best_permutation, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )
                if polished_cost < G_fit:
                    G_fit = polished_cost
                    best_permutation = polished_perm

            history.append(float(G_fit))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[idx] for idx in best_permutation]

        stats = {
            "algorithm": "QPSO",
            "history": history,
            "beta_history": beta_history,
            "tunnels": quantum_jumps,
            "best_energy": round(float(G_fit), 2),
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
        if n_vehicles == 1 or len(stops_data) <= 1:
            route, stats = self.solve_single_tour(
                all_nodes, dist_matrix, time_matrix, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
            )
            return [route], stats

        coords = np.array([[s['coords'][0], s['coords'][1]] for s in stops_data])
        k = min(n_vehicles, len(stops_data))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10).fit(coords)

        clusters = {i: [] for i in range(k)}
        for idx, label in enumerate(kmeans.labels_):
            clusters[label].append(stops_data[idx])

        routes = []
        combined_stats = {
            "algorithm": "QPSO",
            "history": [],
            "beta_history": [],
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
            combined_stats["tunnels"] += s["tunnels"]
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

qpso_solver = QPSOSolver()
