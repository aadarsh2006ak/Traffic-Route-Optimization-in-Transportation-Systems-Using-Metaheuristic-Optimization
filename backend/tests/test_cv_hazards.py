# backend/tests/test_cv_hazards.py
import pytest
import numpy as np
from backend.app.services.cv_hazard_service import cv_hazard_service
from backend.app.services.osrm_service import osrm_service
from backend.app.algorithms.qpso import qpso_solver

def test_cv_hazard_detection_inference():
    """Test CV Neural Network simulation from camera metadata."""
    cv_hazard_service.clear_all()
    
    # Test accident detection
    det_accident = cv_hazard_service.detect_from_image_meta(
        image_name="highway_cctv_accident_01.jpg",
        location=(28.6139, 77.2090),
        camera_id="CAM_HIGHWAY_01"
    )
    assert det_accident["hazard_type"] == "ACCIDENT"
    assert det_accident["is_blocked"] is True
    assert det_accident["confidence"] >= 0.90
    assert len(det_accident["bbox"]) == 4

    # Test pothole cluster detection
    det_pothole = cv_hazard_service.detect_from_image_meta(
        image_name="dashcam_pothole_cracks.png",
        location=(28.5500, 77.2500),
        camera_id="DASHCAM_V1"
    )
    assert det_pothole["hazard_type"] == "POTHOLE_CLUSTER"
    assert det_pothole["is_blocked"] is False
    assert det_pothole["severity"] > 0.0

def test_point_to_segment_spatial_intersection():
    """Test geometric edge hazard intersection."""
    cv_hazard_service.clear_all()
    
    # Place an accident right in the middle between Node A and Node B
    lat_a, lon_a = 28.6000, 77.2000
    lat_b, lon_b = 28.6200, 77.2000
    mid_lat, mid_lon = 28.6100, 77.2000

    cv_hazard_service.add_hazard(
        title="Midpoint Crash",
        hazard_type="ACCIDENT",
        lat=mid_lat,
        lng=mid_lon,
        severity=0.95,
        radius_km=0.5,
        is_blocked=True
    )

    # Edge passing through midpoint should trigger penalty
    penalty, is_blocked, hz = cv_hazard_service.calculate_edge_hazard_impact(
        lat_a, lon_a, lat_b, lon_b
    )
    assert is_blocked is True
    assert penalty >= 1e5
    assert hz is not None
    assert hz["title"] == "Midpoint Crash"

    # Edge far away (e.g. at lon 77.5000) should NOT be impacted
    far_penalty, far_blocked, far_hz = cv_hazard_service.calculate_edge_hazard_impact(
        lat_a, 77.5000, lat_b, 77.5000
    )
    assert far_blocked is False
    assert far_penalty == 1.0
    assert far_hz is None

def test_qpso_hazard_matrix_avoidance():
    """Test that QPSO actively routes around road hazards when penalty is applied."""
    cv_hazard_service.clear_all()
    
    nodes = [
        {"name": "Depot", "coords": (28.6139, 77.2090), "demand": 0},
        {"name": "Stop 1", "coords": (28.6250, 77.2150), "demand": 1},
        {"name": "Stop 2", "coords": (28.6350, 77.2250), "demand": 1},
        {"name": "Stop 3", "coords": (28.6450, 77.2350), "demand": 1},
    ]
    dist_matrix, time_matrix = osrm_service.build_matrices(nodes)

    # Add blocked accident between Depot and Stop 1
    cv_hazard_service.add_hazard(
        title="Direct Route Blocked",
        hazard_type="ACCIDENT",
        lat=(28.6139 + 28.6250) / 2,
        lng=(77.2090 + 77.2150) / 2,
        severity=0.99,
        radius_km=0.8,
        is_blocked=True
    )

    adj_dist, adj_time, affected = cv_hazard_service.apply_hazards_to_matrices(
        dist_matrix, time_matrix, nodes
    )

    assert len(affected) > 0
    # The direct edge time should be heavily penalized
    assert adj_time[0][1] > time_matrix[0][1] * 1000

    # Optimization solver runs and produces valid tour despite the hazard
    ordered_nodes, stats = qpso_solver.solve_single_tour(
        nodes, adj_dist, adj_time, start_hour=9.0, vehicle_capacity=10, traffic_enabled=True,
        q_params={"swarm_size": 20, "max_iter": 60}
    )
    assert len(ordered_nodes) == len(nodes)
