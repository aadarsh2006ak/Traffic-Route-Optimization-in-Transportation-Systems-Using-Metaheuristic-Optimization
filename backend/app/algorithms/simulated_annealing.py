# backend/app/algorithms/simulated_annealing.py
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler

class SimulatedAnnealingSolver:
    """
    Simulated Annealing (SA) metaheuristic with Quantum Tunneling.
    Simulates thermal cooling combined with barrier penetration to escape local optima.
    """
    def __init__(
        self,
        initial_temp: float = 100.0,
        cooling_rate: float = 0.995,
        max_iter: float = 2500,
        tunneling_prob: float = 0.05
    ):
        self.initial_temp = initial_temp
        self.cooling_rate = cooling_rate
        self.max_iter = max_iter
        self.tunneling_prob = tunneling_prob

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
        for k in ["sa_params", "q_params"]:
            if k in kwargs and kwargs[k]:
                merged_params.update(kwargs[k])

        p_iter = int(merged_params.get("iter", self.max_iter))
        p_cool = float(merged_params.get("cool", self.cooling_rate))
        p_temp = float(merged_params.get("temp", self.initial_temp))

        # Greedy Initial Sequence (Nearest Neighbor)
        unvisited = set(range(1, n))
        curr_route = [0]
        curr_node = 0
        while unvisited:
            next_node = min(unvisited, key=lambda x: dist_matrix[curr_node][x])
            curr_route.append(next_node)
            unvisited.remove(next_node)
            curr_node = next_node

        curr_cost, _ = constraint_handler.evaluate_route_fitness(
            curr_route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
        )
        best_route = curr_route[:]
        best_cost = curr_cost

        temperature = (curr_cost / n) * p_temp
        history = [float(curr_cost)]
        tunneling_events = 0

        for it in range(p_iter):
            temperature *= p_cool
            new_route = curr_route[:]

            # Hybrid Mutation: 40% 2-Opt reverse, 40% Swap, 20% Insertion
            r_val = np.random.rand()
            if r_val < 0.40:
                i, j = np.random.randint(1, n), np.random.randint(1, n)
                if i > j: i, j = j, i
                new_route[i:j+1] = new_route[i:j+1][::-1]
            elif r_val < 0.80:
                idx1, idx2 = np.random.randint(1, n), np.random.randint(1, n)
                new_route[idx1], new_route[idx2] = new_route[idx2], new_route[idx1]
            else:
                idx = np.random.randint(1, n)
                target = np.random.randint(1, n)
                item = new_route.pop(idx)
                new_route.insert(target, item)

            new_cost, _ = constraint_handler.evaluate_route_fitness(
                new_route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )

            # Metropolis Acceptance Criterion with Quantum Tunneling
            delta_e = new_cost - curr_cost
            if delta_e < 0:
                curr_route = new_route
                curr_cost = new_cost
                if curr_cost < best_cost:
                    best_cost = curr_cost
                    best_route = curr_route[:]
            else:
                # Metropolis Boltzmann or Quantum Tunneling
                boltzmann = np.exp(-delta_e / max(temperature, 1e-6))
                tunnel_barrier = np.exp(-delta_e / (max(temperature, 1e-6) * 2.5))
                if np.random.rand() < boltzmann or (np.random.rand() < self.tunneling_prob * tunnel_barrier):
                    tunneling_events += 1
                    curr_route = new_route
                    curr_cost = new_cost

            history.append(float(best_cost))

        # Deterministic 2-Opt Polish
        improved = True
        step = 0
        while improved and step < 30:
            improved = False
            step += 1
            for i in range(1, n - 1):
                for j in range(i + 1, n):
                    test_r = best_route[:]
                    test_r[i:j+1] = best_route[i:j+1][::-1]
                    c, _ = constraint_handler.evaluate_route_fitness(
                        test_r, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                    )
                    if c < best_cost - 1e-4:
                        best_cost = c
                        best_route = test_r
                        improved = True
                        break
                if improved:
                    break

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_route]
        return ordered_nodes, {
            "algorithm": "Simulated Annealing",
            "history": history,
            "tunnels": tunneling_events,
            "best_energy": round(float(best_cost), 2),
            "iterations": p_iter,
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
            "algorithm": "Simulated Annealing",
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

sa_solver = SimulatedAnnealingSolver()
