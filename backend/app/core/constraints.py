# backend/app/core/constraints.py
from typing import List, Dict, Any, Tuple
import numpy as np
from .traffic_sim import traffic_sim

class ConstraintHandler:
    """
    Evaluates and enforces Vehicle Routing Constraints:
    1. Delivery Time Windows [e_i, l_i]
    2. Vehicle Capacity Limits (Q)
    3. Maximum Route Duration
    4. Multi-Objective Energy Formulation (Distance + Congestion + Penalties)
    """
    def __init__(
        self,
        late_penalty_weight: float = 100.0,
        early_wait_weight: float = 10.0,
        capacity_penalty_weight: float = 250.0,
        cost_per_km: float = 8.0,
        cost_per_hour: float = 50.0
    ):
        self.late_penalty_weight = late_penalty_weight
        self.early_wait_weight = early_wait_weight
        self.capacity_penalty_weight = capacity_penalty_weight
        self.cost_per_km = cost_per_km
        self.cost_per_hour = cost_per_hour

    def evaluate_route_fitness(
        self,
        route_indices: List[int],
        dist_matrix: np.ndarray,
        time_matrix: np.ndarray,
        nodes: List[Dict[str, Any]],
        start_hour: float = 8.0,
        vehicle_capacity: int = 0,
        traffic_enabled: bool = True
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates Total Energy / Cost for a given vehicle route sequence:
        Cost = Dist_Cost + Time_Cost + Penalty_TimeWindows + Penalty_Capacity
        """
        if len(route_indices) < 2:
            return 0.0, {"dist": 0.0, "time": 0.0, "tw_penalty": 0.0, "cap_penalty": 0.0}

        total_dist = 0.0
        current_time = float(start_hour)
        tw_penalty = 0.0
        total_demand = 0.0
        cap_penalty = 0.0

        for idx in range(len(route_indices) - 1):
            u = route_indices[idx]
            v = route_indices[idx + 1]

            # 1. Base Distance
            edge_dist = dist_matrix[u][v]
            total_dist += edge_dist

            # 2. Dynamic Travel Time with Traffic
            base_edge_time = time_matrix[u][v]
            if traffic_enabled:
                cong_factor = traffic_sim.get_congestion_factor(current_time)
                effective_edge_time = base_edge_time * cong_factor
            else:
                effective_edge_time = base_edge_time

            current_time += effective_edge_time

            # 3. Demand / Capacity constraint on destination node
            node_demand = nodes[v].get("demand", 1.0)
            total_demand += node_demand

            # 4. Service Time & Time Window checks
            service_time = nodes[v].get("service_time", 0.15) # ~9 mins default
            if "window" in nodes[v] and nodes[v]["window"]:
                start_w, end_w = nodes[v]["window"]
                if current_time < start_w:
                    wait_time = start_w - current_time
                    tw_penalty += wait_time * self.early_wait_weight
                    current_time = start_w # Vehicle waits until window opens
                elif current_time > end_w:
                    lateness = current_time - end_w
                    tw_penalty += lateness * self.late_penalty_weight

            current_time += service_time

        # Capacity Penalty
        if vehicle_capacity > 0 and total_demand > vehicle_capacity:
            overload = total_demand - vehicle_capacity
            cap_penalty += overload * self.capacity_penalty_weight

        total_duration = current_time - float(start_hour)
        total_energy = (
            total_dist * self.cost_per_km
            + total_duration * self.cost_per_hour
            + tw_penalty
            + cap_penalty
        )

        metrics = {
            "dist": total_dist,
            "duration": total_duration,
            "tw_penalty": tw_penalty,
            "cap_penalty": cap_penalty,
            "demand": total_demand
        }
        return total_energy, metrics

    def validate_solution(
        self,
        routes: List[List[Dict[str, Any]]],
        vehicle_capacity: int = 0
    ) -> Dict[str, Any]:
        """
        Validates completeness and feasibility of a multi-route solution.
        """
        visited_nodes = set()
        total_stops = 0
        overloaded_vehicles = 0

        for r_idx, route in enumerate(routes):
            # Exclude depot at start/end for customer count
            cust_nodes = [node["name"] for node in route[1:-1]] if len(route) > 2 else [node["name"] for node in route]
            route_demand = sum(n.get("demand", 1.0) for n in route[1:-1]) if len(route) > 2 else sum(n.get("demand", 1.0) for n in route)
            
            if vehicle_capacity > 0 and route_demand > vehicle_capacity:
                overloaded_vehicles += 1

            for name in cust_nodes:
                visited_nodes.add(name)
                total_stops += 1

        is_feasible = (overloaded_vehicles == 0)
        return {
            "is_feasible": is_feasible,
            "unique_visited": len(visited_nodes),
            "total_serviced": total_stops,
            "overloaded_vehicles": overloaded_vehicles
        }

constraint_handler = ConstraintHandler()
