# logic.py - Compatibility Bridge
from backend.app.algorithms import ALGORITHM_REGISTRY, qpso_solver
from backend.app.services.osrm_service import osrm_service
from backend.app.benchmarking.runner import benchmark_runner

def optimize_route_algo(start, stops, round_trip=False, fleet_size=1, quantum_params=None, algorithm="QPSO", capacity=0, traffic_hour=9.0, traffic_enabled=True):
    all_nodes = [start] + stops
    dist_matrix, time_matrix = osrm_service.build_matrices(all_nodes)
    solver = ALGORITHM_REGISTRY.get(algorithm, qpso_solver)
    
    routes, stats = solver.solve(
        start_node=start,
        stops_data=stops,
        dist_matrix=dist_matrix,
        time_matrix=time_matrix,
        n_vehicles=fleet_size,
        vehicle_capacity=capacity,
        traffic_hour=traffic_hour,
        traffic_enabled=traffic_enabled,
        params=quantum_params
    )
    
    if round_trip or fleet_size > 1:
        for i in range(len(routes)):
            routes[i].append(routes[i][0])
            
    return routes, stats
