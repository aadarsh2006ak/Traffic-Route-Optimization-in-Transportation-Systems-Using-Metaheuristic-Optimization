# backend/app/optimizers/genetic_algorithm.py
import time
import random
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
from ..core.constraints import constraint_handler

class GeneticAlgorithmSolver:
    """
    Genetic Algorithm (GA) baseline for VRP & TSP with Order Crossover (OX) and Inversion Mutation.
    """
    def __init__(
        self,
        pop_size: int = 50,
        generations: int = 500,
        crossover_prob: float = 0.85,
        mutation_prob: float = 0.25,
        elite_size: int = 2
    ):
        self.pop_size = pop_size
        self.generations = generations
        self.crossover_prob = crossover_prob
        self.mutation_prob = mutation_prob
        self.elite_size = elite_size

    def _order_crossover(self, parent1: List[int], parent2: List[int]) -> List[int]:
        n = len(parent1)
        if n <= 2:
            return parent1[:]
        idx1, idx2 = sorted(random.sample(range(1, n), 2))
        child = [None] * n
        child[0] = 0
        child[idx1:idx2] = parent1[idx1:idx2]
        
        filled = set(child[idx1:idx2])
        p2_remaining = [item for item in parent2[1:] if item not in filled]
        
        ptr = 0
        for i in range(1, n):
            if child[i] is None:
                child[i] = p2_remaining[ptr]
                ptr += 1
        return child

    def _mutate(self, route: List[int]) -> List[int]:
        n = len(route)
        if n <= 3:
            return route[:]
        r = route[:]
        if random.random() < 0.5:
            # 2-opt inversion mutation
            i, j = sorted(random.sample(range(1, n), 2))
            r[i:j+1] = reversed(r[i:j+1])
        else:
            # swap mutation
            i, j = random.sample(range(1, n), 2)
            r[i], r[j] = r[j], r[i]
        return r

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
        pop_size = int(merged.get("pop_size", self.pop_size))
        generations = int(merged.get("generations", self.generations))
        cx_prob = float(merged.get("crossover_prob", self.crossover_prob))
        mut_prob = float(merged.get("mutation_prob", self.mutation_prob))

        cust_indices = list(range(1, n))
        population = []
        for _ in range(pop_size):
            perm = cust_indices[:]
            random.shuffle(perm)
            population.append([0] + perm)

        fits = [
            constraint_handler.evaluate_route_fitness(
                ind, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
            )[0]
            for ind in population
        ]

        best_idx = int(np.argmin(fits))
        best_ind = population[best_idx][:]
        best_fit = fits[best_idx]
        history = [float(best_fit)]

        for gen in range(1, generations + 1):
            # Sort population by fitness
            sorted_indices = np.argsort(fits)
            new_pop = [population[i][:] for i in sorted_indices[:self.elite_size]]

            while len(new_pop) < pop_size:
                # Tournament Selection
                c1, c2 = random.sample(range(pop_size), 2)
                p1 = population[c1] if fits[c1] < fits[c2] else population[c2]
                
                c3, c4 = random.sample(range(pop_size), 2)
                p2 = population[c3] if fits[c3] < fits[c4] else population[c4]

                if random.random() < cx_prob:
                    child = self._order_crossover(p1, p2)
                else:
                    child = p1[:]

                if random.random() < mut_prob:
                    child = self._mutate(child)

                new_pop.append(child)

            population = new_pop
            fits = [
                constraint_handler.evaluate_route_fitness(
                    ind, dist_matrix, time_matrix, nodes, start_hour, vehicle_capacity, traffic_enabled
                )[0]
                for ind in population
            ]

            gen_best_idx = int(np.argmin(fits))
            if fits[gen_best_idx] < best_fit:
                best_fit = fits[gen_best_idx]
                best_ind = population[gen_best_idx][:]

            history.append(float(best_fit))

        t_elapsed = time.time() - t_start
        ordered_nodes = [nodes[i] for i in best_ind]

        stats = {
            "algorithm": "Genetic Algorithm",
            "history": history,
            "tunnels": 0,
            "best_energy": round(float(best_fit), 2),
            "iterations": generations,
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
            "algorithm": "Genetic Algorithm",
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

genetic_solver = GeneticAlgorithmSolver()
