# backend/tests/test_benchmarks.py
import pytest
from backend.app.benchmarking.runner import benchmark_runner

def test_benchmark_suite_execution():
    start_node = {"name": "Hub", "coords": (28.6139, 77.2090)}
    stops = [
        {"name": "A", "coords": (28.6250, 77.2150)},
        {"name": "B", "coords": (28.6350, 77.2250)},
        {"name": "C", "coords": (28.6050, 77.1950)},
    ]

    results = benchmark_runner.run_benchmark(
        start_node=start_node,
        stops_data=stops,
        algorithms_to_run=["QPSO", "Simulated Annealing"],
        fleet_size=1,
        custom_params={
            "QPSO": {"swarm_size": 15, "max_iter": 40},
            "Simulated Annealing": {"iter": 100}
        }
    )

    assert "summary_table" in results
    assert "convergence_df" in results
    assert len(results["summary_table"]) == 2
    assert "Distance (km)" in results["summary_table"].columns
