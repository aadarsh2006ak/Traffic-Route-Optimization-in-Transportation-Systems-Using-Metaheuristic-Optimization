# backend/tests/test_constraints.py
import pytest
import numpy as np
from backend.app.core.constraints import constraint_handler
from backend.app.core.traffic_sim import traffic_sim

def test_traffic_multiplier():
    # Peak hour morning
    morning_peak = traffic_sim.get_congestion_factor(8.5)
    # Night free flow
    night_flow = traffic_sim.get_congestion_factor(2.0)
    assert morning_peak > 1.5
    assert night_flow < 1.1

def test_capacity_penalty():
    nodes = [
        {"name": "Depot", "coords": (0, 0), "demand": 0},
        {"name": "Stop 1", "coords": (1, 1), "demand": 10},
        {"name": "Stop 2", "coords": (2, 2), "demand": 15},
    ]
    dist_matrix = np.array([[0, 5, 10], [5, 0, 5], [10, 5, 0]])
    time_matrix = dist_matrix / 50.0

    # Low capacity -> penalty
    cost_penalized, m1 = constraint_handler.evaluate_route_fitness(
        [0, 1, 2], dist_matrix, time_matrix, nodes, start_hour=8.0, vehicle_capacity=10, traffic_enabled=False
    )
    # Ample capacity -> no penalty
    cost_normal, m2 = constraint_handler.evaluate_route_fitness(
        [0, 1, 2], dist_matrix, time_matrix, nodes, start_hour=8.0, vehicle_capacity=50, traffic_enabled=False
    )
    assert m1["cap_penalty"] > 0
    assert m2["cap_penalty"] == 0
    assert cost_penalized > cost_normal

def test_time_window_penalty():
    nodes = [
        {"name": "Depot", "coords": (0, 0)},
        {"name": "Stop 1", "coords": (1, 1), "window": (9.0, 10.0)},
        {"name": "Stop 2", "coords": (2, 2), "window": (9.0, 9.5)}, # Tight window
    ]
    dist_matrix = np.array([[0, 50, 100], [50, 0, 50], [100, 50, 0]])
    time_matrix = np.array([[0, 2.0, 4.0], [2.0, 0, 2.0], [4.0, 2.0, 0]])

    cost, metrics = constraint_handler.evaluate_route_fitness(
        [0, 1, 2], dist_matrix, time_matrix, nodes, start_hour=8.0, vehicle_capacity=0, traffic_enabled=False
    )
    assert metrics["tw_penalty"] > 0
