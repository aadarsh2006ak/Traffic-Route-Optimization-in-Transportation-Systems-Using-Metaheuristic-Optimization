# app.py - Compatibility Bridge
from backend.app.algorithms.qpso import qpso_solver
from backend.app.algorithms.simulated_annealing import sa_solver
from backend.app.services.osrm_service import osrm_service
from backend.app.core.constraints import constraint_handler

def build_matrices(nodes):
    return osrm_service.build_matrices(nodes)

def calculate_energy(route_indices, dist_matrix, time_matrix, nodes):
    cost, _ = constraint_handler.evaluate_route_fitness(route_indices, dist_matrix, time_matrix, nodes)
    return cost

def simulated_quantum_annealing(nodes, q_params=None):
    dist_matrix, time_matrix = osrm_service.build_matrices(nodes)
    return sa_solver.solve_single_tour(nodes, dist_matrix, time_matrix, params=q_params)

def solve_hybrid_quantum(start_node, stops_data, n_vehicles=1, q_params=None):
    all_nodes = [start_node] + stops_data
    dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)
    return qpso_solver.solve(
        start_node=start_node,
        stops_data=stops_data,
        dist_matrix=dist_matrix,
        time_matrix=time_matrix,
        n_vehicles=n_vehicles,
        params=q_params
    )