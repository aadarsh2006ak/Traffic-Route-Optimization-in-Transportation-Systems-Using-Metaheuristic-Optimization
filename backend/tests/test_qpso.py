# backend/tests/test_qpso.py
import pytest
import numpy as np
from backend.app.optimizers.qpso import QPSOSolver

def test_qpso_initialization_and_hyperparameters():
    solver = QPSOSolver(swarm_size=30, max_iter=100, beta_max=1.0, beta_min=0.5)
    assert solver.swarm_size == 30
    assert solver.max_iter == 100
    assert solver.beta_max == 1.0
    assert solver.beta_min == 0.5

def test_qpso_random_key_decoding():
    solver = QPSOSolver()
    keys = np.array([2.5, -1.2, 0.8, -3.0])
    perm = solver._decode_keys_to_permutation(keys, num_customers=4)
    assert perm[0] == 0  # Depot must always be first
    assert len(perm) == 5
    assert set(perm) == {0, 1, 2, 3, 4}

def test_qpso_convergence_on_toy_graph():
    solver = QPSOSolver(swarm_size=20, max_iter=50)
    nodes = [
        {"name": "Depot", "coords": (28.61, 77.20), "demand": 0.0},
        {"name": "Stop A", "coords": (28.62, 77.21), "demand": 1.0},
        {"name": "Stop B", "coords": (28.63, 77.22), "demand": 2.0},
        {"name": "Stop C", "coords": (28.64, 77.23), "demand": 1.5},
    ]
    n = len(nodes)
    dist_mat = np.array([
        [0.0, 5.0, 8.0, 12.0],
        [5.0, 0.0, 4.0, 9.0],
        [8.0, 4.0, 0.0, 6.0],
        [12.0, 9.0, 6.0, 0.0]
    ])
    time_mat = dist_mat / 40.0

    route, stats = solver.solve_single_tour(
        nodes=nodes,
        dist_matrix=dist_mat,
        time_matrix=time_mat,
        start_hour=9.0,
        vehicle_capacity=10,
        traffic_enabled=True
    )

    assert len(route) == 4
    assert stats["algorithm"] == "QPSO"
    assert stats["iterations"] == 50
    assert len(stats["history"]) == 51 # Initial + 50 iterations
    assert stats["history"][-1] <= stats["history"][0] # Must show energy minimization
