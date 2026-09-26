# backend/tests/test_graph_builder.py
import pytest
import networkx as nx
from backend.app.graph.graph_builder import graph_builder
from backend.app.graph.traffic_simulator import traffic_simulator

def test_synthetic_graph_generation():
    nodes, dist_mat, time_mat, G = graph_builder.generate_synthetic_graph(node_count=10)
    assert len(nodes) == 10
    assert dist_mat.shape == (10, 10)
    assert time_mat.shape == (10, 10)
    assert isinstance(G, nx.DiGraph)
    assert G.number_of_nodes() == 10
    assert G.number_of_edges() == 90 # 10 * 9 directed edges

def test_graph_analytics_metrics():
    _, _, _, G = graph_builder.generate_synthetic_graph(node_count=8)
    analytics = graph_builder.get_graph_analytics(G)
    assert analytics["num_nodes"] == 8
    assert analytics["num_edges"] == 56
    assert "graph_density" in analytics
    assert "degree_centrality" in analytics
    assert "betweenness_centrality" in analytics

def test_dynamic_traffic_congestion_factor():
    # Morning rush at 8:30 AM should be heavier than off-peak at 3:00 AM
    morning_factor = traffic_simulator.get_congestion_factor(8.5)
    night_factor = traffic_simulator.get_congestion_factor(3.0)
    assert morning_factor > 1.3
    assert night_factor < 1.1
    assert morning_factor > night_factor
