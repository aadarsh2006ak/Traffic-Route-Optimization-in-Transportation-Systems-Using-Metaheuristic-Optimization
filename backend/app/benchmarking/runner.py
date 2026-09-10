# backend/app/benchmarking/runner.py
from typing import List, Dict, Any, Optional
import time
import pandas as pd
from ..algorithms import ALGORITHM_REGISTRY
from ..services.osrm_service import osrm_service
from ..core.constraints import constraint_handler
from .metrics import calculate_benchmark_metrics
from .convergence_plot import build_convergence_dataframe

class BenchmarkRunner:
    """
    Automated Multi-Algorithm Benchmarking Suite.
    Runs QPSO, Simulated Annealing, Genetic Algorithm, Ant Colony, Classical PSO, and Exact Solvers
    under identical problem instances, distance matrices, and traffic conditions.
    """
    def run_benchmark(
        self,
        start_node: Dict[str, Any],
        stops_data: List[Dict[str, Any]],
        algorithms_to_run: Optional[List[str]] = None,
        fleet_size: int = 1,
        vehicle_capacity: int = 0,
        traffic_hour: float = 9.0,
        traffic_enabled: bool = True,
        round_trip: bool = False,
        custom_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes comparative benchmarking on the specified stops.
        """
        all_nodes = [start_node] + stops_data
        dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)

        selected_algos = algorithms_to_run or ["QPSO", "Simulated Annealing", "Genetic Algorithm", "Ant Colony"]
        results_list = []
        histories = {}
        runtimes = {}

        for algo_name in selected_algos:
            solver = ALGORITHM_REGISTRY.get(algo_name)
            if not solver:
                continue

            # Skip exact solver if problem size too large
            if algo_name.startswith("Exact") and len(all_nodes) > 12:
                continue

            t_start = time.time()
            routes, stats = solver.solve(
                start_node=start_node,
                stops_data=stops_data,
                dist_matrix=dist_matrix,
                time_matrix=time_matrix,
                n_vehicles=fleet_size,
                vehicle_capacity=vehicle_capacity,
                traffic_hour=traffic_hour,
                traffic_enabled=traffic_enabled,
                q_params=custom_params.get(algo_name) if custom_params else None
            )
            t_duration = time.time() - t_start

            # Calculate total driving distance and time across routes
            total_km = 0.0
            total_duration_min = 0.0

            for route in routes:
                r_nodes = route[:]
                if round_trip or fleet_size > 1:
                    r_nodes.append(r_nodes[0])
                coords_seq = [n["coords"] for n in r_nodes]
                _, km, mins = osrm_service.get_route_geometry(coords_seq)
                total_km += km
                total_duration_min += mins

            validation = constraint_handler.validate_solution(routes, vehicle_capacity)

            run_record = {
                "algorithm": algo_name,
                "distance_km": total_km,
                "duration_min": total_duration_min,
                "runtime_sec": stats.get("runtime", t_duration),
                "iterations": stats.get("iterations", len(stats.get("history", []))),
                "tunnels": stats.get("tunnels", 0),
                "best_energy": stats.get("best_energy", 0.0),
                "is_feasible": validation["is_feasible"],
                "routes": routes
            }
            results_list.append(run_record)
            histories[algo_name] = stats.get("history", [])
            runtimes[algo_name] = stats.get("runtime", t_duration)

        summary_table = calculate_benchmark_metrics(results_list)
        summary_df = pd.DataFrame(summary_table)
        convergence_df = build_convergence_dataframe(histories)
        runtime_df = pd.DataFrame({
            "Algorithm": list(runtimes.keys()),
            "Runtime (s)": list(runtimes.values())
        }).set_index("Algorithm")

        return {
            "summary_table": summary_df,
            "convergence_df": convergence_df,
            "runtime_df": runtime_df,
            "raw_results": results_list
        }

benchmark_runner = BenchmarkRunner()
