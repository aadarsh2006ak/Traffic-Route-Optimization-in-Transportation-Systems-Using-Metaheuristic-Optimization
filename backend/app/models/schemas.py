# backend/app/models/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional, Tuple

class LocationNodeSchema(BaseModel):
    name: str
    coords: Tuple[float, float] = Field(description="Latitude, Longitude")
    demand: Optional[float] = 1.0
    window: Optional[Tuple[float, float]] = None # [earliest_hour, latest_hour]
    service_time: Optional[float] = 0.15 # in hours

class GraphLoadRequest(BaseModel):
    place_name: Optional[str] = Field(default="Delhi, India", description="City or region name for OSMnx")
    graph_type: Optional[str] = Field(default="osmnx", description="'osmnx' | 'synthetic' | 'custom'")
    node_count: Optional[int] = Field(default=20, ge=5, le=1000)
    traffic_hour: Optional[float] = Field(default=9.0, ge=0.0, le=24.0)

class OptimizeRunRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    graph_id: Optional[str] = None
    start_location: LocationNodeSchema
    stops: List[LocationNodeSchema]
    algorithm: Optional[str] = "QPSO"
    num_vehicles: Optional[int] = Field(default=1, ge=1, le=20, alias="fleet_size")
    vehicle_capacity: Optional[int] = Field(default=0, ge=0)
    round_trip: Optional[bool] = False
    traffic_enabled: Optional[bool] = True
    traffic_hour: Optional[float] = Field(default=9.0, ge=0.0, le=24.0)
    alpha_weight: Optional[float] = 0.4 # Distance weight
    beta_weight: Optional[float] = 0.4  # Travel time weight
    gamma_weight: Optional[float] = 0.2 # Congestion weight
    hazards_enabled: Optional[bool] = True
    algorithm_params: Optional[Dict[str, Any]] = None

class BenchmarkRunRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    graph_id: Optional[str] = None
    start_location: LocationNodeSchema
    stops: List[LocationNodeSchema]
    algorithms: Optional[List[str]] = ["QPSO", "Classical PSO", "Genetic Algorithm", "Ant Colony", "Exact Solver"]
    num_vehicles: Optional[int] = Field(default=1, ge=1, le=20, alias="fleet_size")
    vehicle_capacity: Optional[int] = Field(default=0, ge=0)
    traffic_enabled: Optional[bool] = True
    traffic_hour: Optional[float] = 9.0
    round_trip: Optional[bool] = False
    trials_per_algo: Optional[int] = Field(default=1, ge=1, le=30)
    custom_params: Optional[Dict[str, Any]] = None

class AlgorithmBenchmarkResult(BaseModel):
    algorithm: str
    total_cost: float
    total_distance_km: float
    total_duration_min: float
    congestion_cost: float
    iterations_to_converge: int
    runtime_sec: float
    stability_std_dev: Optional[float] = 0.0
    success_rate_pct: float = 100.0
    convergence_history: List[float] = []

class BenchmarkSummaryResponse(BaseModel):
    status: str
    run_id: str
    timestamp: str
    graph_name: Optional[str] = "Dynamic Road Network"
    num_nodes: int
    num_vehicles: int
    results: List[AlgorithmBenchmarkResult]
    best_algorithm: str
    qpso_improvement_over_pso_pct: Optional[float] = None
    qpso_improvement_over_ga_pct: Optional[float] = None
