# backend/app/algorithms/shortest_path.py
import heapq
import networkx as nx
from typing import List, Dict, Any, Tuple, Optional

class ShortestPathFinder:
    """
    Dijkstra and A* shortest path algorithms operating on dynamic weighted graphs.
    """
    @staticmethod
    def dijkstra_path(
        graph: nx.DiGraph,
        source: int,
        target: int,
        weight_attribute: str = "weight"
    ) -> Tuple[List[int], float]:
        """
        Computes standard shortest path between source and target node indices.
        """
        try:
            path = nx.dijkstra_path(graph, source, target, weight=weight_attribute)
            length = nx.dijkstra_path_length(graph, source, target, weight=weight_attribute)
            return path, float(length)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return [], float("inf")

    @staticmethod
    def astar_path(
        graph: nx.DiGraph,
        source: int,
        target: int,
        heuristic_func=None,
        weight_attribute: str = "weight"
    ) -> Tuple[List[int], float]:
        """
        Computes A* heuristic path between source and target node indices.
        """
        try:
            path = nx.astar_path(graph, source, target, heuristic=heuristic_func, weight=weight_attribute)
            length = nx.astar_path_length(graph, source, target, heuristic=heuristic_func, weight=weight_attribute)
            return path, float(length)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return [], float("inf")

shortest_path_finder = ShortestPathFinder()
