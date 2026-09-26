# backend/app/models/db_models.py
import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class GraphEntity(Base):
    """
    Stores road network graph definitions, nodes, coordinates, and OSMnx metadata.
    """
    __tablename__ = "road_graphs"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    place_name = Column(String(256), nullable=True)
    graph_type = Column(String(32), default="osmnx") # 'osmnx' | 'synthetic' | 'custom'
    node_count = Column(Integer, default=0)
    edge_count = Column(Integer, default=0)
    graph_data = Column(JSON, nullable=True) # Full nodes, edges, distance matrix payload
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OptimizationRunEntity(Base):
    """
    Stores individual optimization execution results, vehicle routes, and convergence stats.
    """
    __tablename__ = "optimization_runs"

    id = Column(String(64), primary_key=True, index=True)
    graph_id = Column(String(64), nullable=True, index=True)
    algorithm = Column(String(64), nullable=False, default="QPSO")
    fleet_size = Column(Integer, default=1)
    vehicle_capacity = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    total_distance_km = Column(Float, default=0.0)
    total_duration_min = Column(Float, default=0.0)
    runtime_sec = Column(Float, default=0.0)
    convergence_history = Column(JSON, nullable=True)
    routes_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BenchmarkRunEntity(Base):
    """
    Stores multi-algorithm benchmark comparisons across QPSO, GA, ACO, Classical PSO, Exact Methods.
    """
    __tablename__ = "benchmark_runs"

    id = Column(String(64), primary_key=True, index=True)
    graph_id = Column(String(64), nullable=True, index=True)
    graph_name = Column(String(128), default="Road Network")
    num_nodes = Column(Integer, default=0)
    num_vehicles = Column(Integer, default=1)
    best_algorithm = Column(String(64), nullable=True)
    results_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    items = relationship("BenchmarkResultItemEntity", back_populates="benchmark_run", cascade="all, delete-orphan")

class BenchmarkResultItemEntity(Base):
    """
    Stores single algorithm performance item within a benchmark run.
    """
    __tablename__ = "benchmark_result_items"

    id = Column(String(64), primary_key=True, index=True)
    benchmark_run_id = Column(String(64), ForeignKey("benchmark_runs.id"), nullable=False, index=True)
    algorithm = Column(String(64), nullable=False)
    total_cost = Column(Float, default=0.0)
    distance_km = Column(Float, default=0.0)
    duration_min = Column(Float, default=0.0)
    congestion_cost = Column(Float, default=0.0)
    iterations_to_converge = Column(Integer, default=0)
    runtime_sec = Column(Float, default=0.0)
    stability_std_dev = Column(Float, default=0.0)
    success_rate_pct = Column(Float, default=100.0)
    convergence_history = Column(JSON, nullable=True)

    benchmark_run = relationship("BenchmarkRunEntity", back_populates="items")
