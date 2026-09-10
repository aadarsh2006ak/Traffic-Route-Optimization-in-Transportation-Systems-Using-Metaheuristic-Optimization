# backend/tests/test_qpso.py
import pytest
import numpy as np
from backend.app.algorithms.qpso import qpso_solver
from backend.app.services.osrm_service import osrm_service

def test_qpso_single_tour_convergence():
    nodes = [
        {"name": "Depot", "coords": (28.6139, 77.2090), "demand": 0},
        {"name": "Stop 1", "coords": (28.6250, 77.2150), "demand": 1},
        {"name": "Stop 2", "coords": (28.6350, 77.2250), "demand": 2},
        {"name": "Stop 3", "coords": (28.6450, 77.2350), "demand": 1},
        {"name": "Stop 4", "coords": (28.6050, 77.1950), "demand": 2},
    ]
    dist_matrix, time_matrix = osrm_service.build_matrices(nodes)

    ordered_nodes, stats = qpso_solver.solve_single_tour(
        nodes, dist_matrix, time_matrix, start_hour=9.0, vehicle_capacity=10, traffic_enabled=True,
        q_params={"swarm_size": 20, "max_iter": 100}
    )

    assert len(ordered_nodes) == len(nodes)
    assert ordered_nodes[0]["name"] == "Depot"
    assert stats["algorithm"] == "QPSO"
    assert len(stats["history"]) > 0
    # Final best energy should be less than or equal to initial energy
    assert stats["history"][-1] <= stats["history"][0]

def test_qpso_multi_vehicle():
    start_node = {"name": "Depot", "coords": (28.6139, 77.2090)}
    stops = [
        {"name": "Stop 1", "coords": (28.6250, 77.2150), "demand": 1},
        {"name": "Stop 2", "coords": (28.6350, 77.2250), "demand": 1},
        {"name": "Stop 3", "coords": (28.5850, 77.1850), "demand": 1},
        {"name": "Stop 4", "coords": (28.5750, 77.1750), "demand": 1},
    ]
    all_nodes = [start_node] + stops
    dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)

    routes, stats = qpso_solver.solve(
        start_node=start_node,
        stops_data=stops,
        dist_matrix=dist_matrix,
        time_matrix=time_matrix,
        n_vehicles=2,
        vehicle_capacity=5,
        traffic_hour=9.0,
        traffic_enabled=True,
        q_params={"swarm_size": 15, "max_iter": 50}
    )

    assert len(routes) == 2
    for route in routes:
        assert route[0]["name"] == "Depot"
