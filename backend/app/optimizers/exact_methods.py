# backend/app/optimizers/exact_methods.py
import time
import itertools
import numpy as np
import networkx as nx
from typing import List, Dict, Any, Tuple
from ..core.constraints import constraint_handler

class ExactMethodsSolver:
    """
    Exact Methods baseline providing ground-truth optimality for small graphs (<= 10 nodes)
    and Dijkstra / A* point-to-point shortest paths on NetworkX DiGraphs.
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
        if n <= 1:
            return nodes, {"history": [0.0], "runtime": 0.0, "tunnels": 0, "iterations": 0}
        if n == 2:
            cost, _ = constraint_handler.evaluate_route_fitness(
                [0, 1], dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            return nodes, {"history": [cost], "runtime": 0.001, "tunnels": 0, "iterations": 1}

        cust_indices = list(range(1, n))
        best_route = None
        best_cost = np.inf
        eval_count = 0
        history = []

        # Exhaustive permutation for small graphs
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
            # Nearest neighbor greedy baseline for larger instances
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
            best_cost = g_cost
            best_route = g_route
            eval_count = len(cust_indices)
            history = [float(best_cost)]

        history.append(float(best_cost))
        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_route] if best_route else nodes

        stats = {
            "algorithm": "Exact Solver",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_cost), 2),
            "iterations": eval_count or 1,
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
        r, s = self.solve_single_tour(
            all_nodes, dist_matrix, time_matrix, traffic_hour, vehicle_capacity, traffic_enabled, params=params, **kwargs
        )
        return [r], s

    @staticmethod
    def dijkstra_shortest_path(
        graph: nx.DiGraph,
        source: int,
        target: int,
        weight: str = "weight"
    ) -> Tuple[List[int], float]:
        """
        Dijkstra point-to-point exact shortest path on NetworkX DiGraph.
        """
        try:
            path = nx.dijkstra_path(graph, source, target, weight=weight)
            cost = nx.dijkstra_path_length(graph, source, target, weight=weight)
            return path, float(cost)
        except Exception:
            return [], float("inf")

    @staticmethod
    def astar_shortest_path(
        graph: nx.DiGraph,
        source: int,
        target: int,
        heuristic=None,
        weight: str = "weight"
    ) -> Tuple[List[int], float]:
        """
        A* point-to-point heuristic-guided shortest path on NetworkX DiGraph.
        """
        try:
            path = nx.astar_path(graph, source, target, heuristic=heuristic, weight=weight)
            cost = nx.astar_path_length(graph, source, target, heuristic=heuristic, weight=weight)
            return path, float(cost)
        except Exception:
            return [], float("inf")

exact_solver = ExactMethodsSolver()
