# backend/app/services/db_service.py
import json
import time
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from ..core.config import settings
from ..models.db_models import Base, GraphEntity, OptimizationRunEntity, BenchmarkRunEntity, BenchmarkResultItemEntity

class DBService:
    """
    SQLAlchemy database service supporting PostgreSQL with automatic fallback to SQLite.
    Stores and retrieves road graphs, individual optimization runs, and full multi-algorithm benchmarks.
    """
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()

    def _initialize_database(self):
        # Attempt PostgreSQL connection
        db_url = settings.DATABASE_URL
        try:
            self.engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            # Test connection
            with self.engine.connect() as conn:
                pass
            Base.metadata.create_all(bind=self.engine)
            self.SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=self.engine))
            print(f"[DBService] Connected to PostgreSQL at {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
        except Exception as e:
            # Fallback to local SQLite
            sqlite_url = settings.SQLITE_FALLBACK_URL
            self.engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
            Base.metadata.create_all(bind=self.engine)
            self.SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=self.engine))
            print(f"[DBService] PostgreSQL unavailable ({e}). Fallback to SQLite at {sqlite_url}")

    def save_graph(self, name: str, place_name: str, graph_type: str, node_count: int, edge_count: int, graph_data: Dict[str, Any]) -> str:
        graph_id = f"graph_{uuid.uuid4().hex[:8]}"
        session = self.SessionLocal()
        try:
            entity = GraphEntity(
                id=graph_id,
                name=name,
                place_name=place_name,
                graph_type=graph_type,
                node_count=node_count,
                edge_count=edge_count,
                graph_data=graph_data
            )
            session.add(entity)
            session.commit()
            return graph_id
        except Exception as e:
            session.rollback()
            return graph_id
        finally:
            session.close()

    def get_graph(self, graph_id: str) -> Optional[Dict[str, Any]]:
        session = self.SessionLocal()
        try:
            entity = session.query(GraphEntity).filter(GraphEntity.id == graph_id).first()
            if not entity:
                return None
            return {
                "id": entity.id,
                "name": entity.name,
                "place_name": entity.place_name,
                "graph_type": entity.graph_type,
                "node_count": entity.node_count,
                "edge_count": entity.edge_count,
                "graph_data": entity.graph_data,
                "created_at": entity.created_at.isoformat() if entity.created_at else None
            }
        finally:
            session.close()

    def save_optimization_run(
        self,
        algorithm: str,
        fleet_size: int,
        vehicle_capacity: int,
        total_cost: float,
        total_distance_km: float,
        total_duration_min: float,
        runtime_sec: float,
        convergence_history: List[float],
        routes_data: List[Dict[str, Any]],
        graph_id: Optional[str] = None
    ) -> str:
        run_id = f"opt_{uuid.uuid4().hex[:8]}"
        session = self.SessionLocal()
        try:
            entity = OptimizationRunEntity(
                id=run_id,
                graph_id=graph_id,
                algorithm=algorithm,
                fleet_size=fleet_size,
                vehicle_capacity=vehicle_capacity,
                total_cost=total_cost,
                total_distance_km=total_distance_km,
                total_duration_min=total_duration_min,
                runtime_sec=runtime_sec,
                convergence_history=convergence_history,
                routes_data=routes_data
            )
            session.add(entity)
            session.commit()
            return run_id
        except Exception:
            session.rollback()
            return run_id
        finally:
            session.close()

    def save_benchmark_run(
        self,
        graph_id: Optional[str],
        graph_name: str,
        num_nodes: int,
        num_vehicles: int,
        results_list: List[Dict[str, Any]]
    ) -> str:
        benchmark_id = f"bench_{uuid.uuid4().hex[:8]}"
        session = self.SessionLocal()
        try:
            best_algo = min(results_list, key=lambda x: x.get("total_cost", float("inf"))).get("algorithm", "QPSO") if results_list else "QPSO"
            bench_entity = BenchmarkRunEntity(
                id=benchmark_id,
                graph_id=graph_id,
                graph_name=graph_name,
                num_nodes=num_nodes,
                num_vehicles=num_vehicles,
                best_algorithm=best_algo,
                results_summary=results_list
            )
            session.add(bench_entity)

            for item in results_list:
                item_id = f"item_{uuid.uuid4().hex[:8]}"
                item_entity = BenchmarkResultItemEntity(
                    id=item_id,
                    benchmark_run_id=benchmark_id,
                    algorithm=item.get("algorithm", "Unknown"),
                    total_cost=item.get("total_cost", 0.0),
                    distance_km=item.get("distance_km", item.get("total_distance_km", 0.0)),
                    duration_min=item.get("duration_min", item.get("total_duration_min", 0.0)),
                    congestion_cost=item.get("congestion_cost", 0.0),
                    iterations_to_converge=item.get("iterations", item.get("iterations_to_converge", 0)),
                    runtime_sec=item.get("runtime_sec", 0.0),
                    stability_std_dev=item.get("stability_std", item.get("stability_std_dev", 0.0)),
                    success_rate_pct=item.get("success_rate_pct", 100.0),
                    convergence_history=item.get("convergence_history", item.get("history", []))
                )
                session.add(item_entity)

            session.commit()
            return benchmark_id
        except Exception:
            session.rollback()
            return benchmark_id
        finally:
            session.close()

    def get_benchmark_run(self, benchmark_id: str) -> Optional[Dict[str, Any]]:
        session = self.SessionLocal()
        try:
            bench = session.query(BenchmarkRunEntity).filter(BenchmarkRunEntity.id == benchmark_id).first()
            if not bench:
                return None
            items = session.query(BenchmarkResultItemEntity).filter(BenchmarkResultItemEntity.benchmark_run_id == benchmark_id).all()
            return {
                "id": bench.id,
                "graph_id": bench.graph_id,
                "graph_name": bench.graph_name,
                "num_nodes": bench.num_nodes,
                "num_vehicles": bench.num_vehicles,
                "best_algorithm": bench.best_algorithm,
                "created_at": bench.created_at.isoformat() if bench.created_at else None,
                "results": [
                    {
                        "algorithm": it.algorithm,
                        "total_cost": it.total_cost,
                        "distance_km": it.distance_km,
                        "duration_min": it.duration_min,
                        "congestion_cost": it.congestion_cost,
                        "iterations": it.iterations_to_converge,
                        "runtime_sec": it.runtime_sec,
                        "stability_std": it.stability_std_dev,
                        "success_rate_pct": it.success_rate_pct,
                        "convergence_history": it.convergence_history
                    }
                    for it in items
                ]
            }
        finally:
            session.close()

    def get_recent_benchmark_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        session = self.SessionLocal()
        try:
            runs = session.query(BenchmarkRunEntity).order_by(BenchmarkRunEntity.created_at.desc()).limit(limit).all()
            return [
                {
                    "run_id": r.id,
                    "graph_name": r.graph_name,
                    "num_nodes": r.num_nodes,
                    "num_vehicles": r.num_vehicles,
                    "best_algorithm": r.best_algorithm,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "summary": r.results_summary
                }
                for r in runs
            ]
        finally:
            session.close()

    def get_recent_runs(self, limit: int = 25) -> List[Dict[str, Any]]:
        session = self.SessionLocal()
        try:
            runs = session.query(OptimizationRunEntity).order_by(OptimizationRunEntity.created_at.desc()).limit(limit).all()
            return [
                {
                    "id": r.id,
                    "algorithm": r.algorithm,
                    "fleet_size": r.fleet_size,
                    "total_distance_km": r.total_distance_km,
                    "duration_min": r.total_duration_min,
                    "runtime_sec": r.runtime_sec,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "summary_data": {
                        "total_cost": r.total_cost,
                        "routes": r.routes_data
                    }
                }
                for r in runs
            ]
        finally:
            session.close()

db_service = DBService()
