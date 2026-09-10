# backend/app/algorithms/genetic_algorithm.py
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
# pyrefly: ignore [missing-import]
from ..core.constraints import constraint_handler

class GeneticAlgorithmSolver:
    """
    Genetic Algorithm (GA) for Permutation VRP/TSP.
    """
    def __init__(
        self,
        pop_size: int = 50,
        generations: int = 600,
        crossover_rate: float = 0.85,
        mutation_rate: float = 0.15,
        elite_count: int = 2
    ):
        self.pop_size = pop_size
        self.generations = generations
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.elite_count = elite_count

    def _order_crossover_ox1(self, parent1: List[int], parent2: List[int]) -> List[int]:
        n = len(parent1)
        if n <= 2:
            return parent1[:]
        p1 = parent1[1:]
        p2 = parent2[1:]
        size = len(p1)

        cx1, cx2 = sorted(np.random.choice(range(size), size=2, replace=False))
        child = [-1] * size
        child[cx1:cx2+1] = p1[cx1:cx2+1]
        copied_set = set(child[cx1:cx2+1])

        p2_idx = 0
        for i in range(size):
            if child[i] == -1:
                while p2[p2_idx] in copied_set:
                    p2_idx += 1
                child[i] = p2[p2_idx]
                copied_set.add(p2[p2_idx])
                p2_idx += 1

        return [0] + child

    def _mutate(self, route: List[int]) -> List[int]:
        mutated = route[:]
        n = len(route)
        if n <= 3:
            return mutated

        if np.random.rand() < 0.5:
            i, j = sorted(np.random.choice(range(1, n), size=2, replace=False))
            mutated[i:j+1] = mutated[i:j+1][::-1]
        else:
            i, j = np.random.choice(range(1, n), size=2, replace=False)
            mutated[i], mutated[j] = mutated[j], mutated[i]
        return mutated

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
        for k in ["ga_params", "q_params"]:
            if k in kwargs and kwargs[k]:
                merged_params.update(kwargs[k])

        pop_size = int(merged_params.get("pop_size", self.pop_size))
        generations = int(merged_params.get("generations", self.generations))
        cx_rate = float(merged_params.get("crossover_rate", self.crossover_rate))
        mut_rate = float(merged_params.get("mutation_rate", self.mutation_rate))

        population = []
        cust_indices = list(range(1, n))
        for _ in range(pop_size):
            shuffled = [0] + list(np.random.permutation(cust_indices))
            population.append(shuffled)

        def get_cost(route):
            c, _ = constraint_handler.evaluate_route_fitness(
                route, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )
            return c

        costs = [get_cost(ind) for ind in population]
        best_idx = np.argmin(costs)
        best_route = population[best_idx][:]
        best_cost = costs[best_idx]
        history = [float(best_cost)]

        for gen in range(1, generations + 1):
            new_pop = []
            sorted_indices = np.argsort(costs)
            for e in range(self.elite_count):
                new_pop.append(population[sorted_indices[e]][:])

            while len(new_pop) < pop_size:
                t1 = np.random.choice(pop_size, size=3, replace=False)
                winner1 = population[t1[np.argmin([costs[k] for k in t1])]]

                t2 = np.random.choice(pop_size, size=3, replace=False)
                winner2 = population[t2[np.argmin([costs[k] for k in t2])]]

                if np.random.rand() < cx_rate:
                    child = self._order_crossover_ox1(winner1, winner2)
                else:
                    child = winner1[:]

                if np.random.rand() < mut_rate:
                    child = self._mutate(child)

                new_pop.append(child)

            population = new_pop
            costs = [get_cost(ind) for ind in population]
            gen_best_idx = np.argmin(costs)
            if costs[gen_best_idx] < best_cost:
                best_cost = costs[gen_best_idx]
                best_route = population[gen_best_idx][:]

            history.append(float(best_cost))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_route]
        return ordered_nodes, {
            "algorithm": "Genetic Algorithm",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_cost), 2),
            "iterations": generations,
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
            "algorithm": "Genetic Algorithm",
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

ga_solver = GeneticAlgorithmSolver()
