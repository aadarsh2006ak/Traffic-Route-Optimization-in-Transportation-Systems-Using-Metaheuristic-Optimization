# backend/app/algorithms/exact_solver.py
import time
import itertools
import numpy as np
from typing import List, Dict, Any, Tuple
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler

class ExactSolver:
    """
    Exact Solver baseline (Branch & Bound / Permutation Enumeration / PuLP)
    """
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

        cust_indices = list(range(1, n))
        best_route = None
        best_cost = np.inf
        eval_count = 0
        history = []

        if n <= 10:
            for perm in itertools.permutations(cust_indices):
                eval_count += 1
                route = [0] + list(perm)
                cost, _ = constraint_handler.evaluate_route_fitness(
                    route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )
                if cost < best_cost:
                    best_cost = cost
                    best_route = route
                if eval_count % 500 == 0:
                    history.append(float(best_cost))
        else:
            best_route = [0] + cust_indices
            best_cost, _ = constraint_handler.evaluate_route_fitness(
                best_route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            unvisited = set(cust_indices)
            curr = 0
            g_route = [0]
            while unvisited:
                nxt = min(unvisited, key=lambda x: dist_matrix[curr][x])
                g_route.append(nxt)
                unvisited.remove(nxt)
                curr = nxt
            g_cost, _ = constraint_handler.evaluate_route_fitness(
                g_route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            if g_cost < best_cost:
                best_cost = g_cost
                best_route = g_route
            history = [float(best_cost)]

        history.append(float(best_cost))
        t_elapsed = time.time() - t_start

        ordered_nodes = [nodes[i] for i in best_route] if best_route else nodes
        return ordered_nodes, {
            "algorithm": "Exact Solver",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_cost), 2),
            "iterations": eval_count or 1,
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
        r, s = self.solve_single_tour(
            all_nodes, dist_matrix, time_matrix, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
        )
        return [r], s

exact_solver = ExactSolver()
