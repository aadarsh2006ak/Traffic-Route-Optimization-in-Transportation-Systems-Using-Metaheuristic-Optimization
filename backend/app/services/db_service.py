# backend/app/services/db_service.py
import sqlite3
import json
import os
import time
from typing import List, Dict, Any, Optional

DB_FILE = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "data", "route_history.db"))

class HistoryDBService:
    """
    SQLite database persistence service for optimization history, metrics,
    and benchmark execution logs.
    """
    def __init__(self):
        self.db_path = os.path.abspath(DB_FILE)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_tables()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS optimization_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL,
                    algorithm TEXT,
                    stop_count INTEGER,
                    fleet_size INTEGER,
                    vehicle_capacity INTEGER,
                    traffic_hour REAL,
                    traffic_enabled INTEGER,
                    total_distance_km REAL,
                    duration_min REAL,
                    runtime_sec REAL,
                    iterations INTEGER,
                    tunnels INTEGER,
                    hazards_avoided INTEGER,
                    summary_json TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS benchmark_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL,
                    dataset_name TEXT,
                    scenario TEXT,
                    stop_count INTEGER,
                    results_json TEXT
                )
            """)
            conn.commit()

    def log_optimization(
        self,
        algorithm: str,
        stop_count: int,
        fleet_size: int,
        vehicle_capacity: int,
        traffic_hour: float,
        traffic_enabled: bool,
        total_distance_km: float,
        duration_min: float,
        runtime_sec: float,
        iterations: int,
        tunnels: int = 0,
        hazards_avoided: int = 0,
        summary_data: Optional[Dict[str, Any]] = None
    ) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO optimization_runs (
                    timestamp, algorithm, stop_count, fleet_size, vehicle_capacity,
                    traffic_hour, traffic_enabled, total_distance_km, duration_min,
                    runtime_sec, iterations, tunnels, hazards_avoided, summary_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                time.time(),
                algorithm,
                stop_count,
                fleet_size,
                vehicle_capacity,
                traffic_hour,
                1 if traffic_enabled else 0,
                total_distance_km,
                duration_min,
                runtime_sec,
                iterations,
                tunnels,
                hazards_avoided,
                json.dumps(summary_data or {})
            ))
            conn.commit()
            return cursor.lastrowid

    def get_recent_runs(self, limit: int = 25) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM optimization_runs ORDER BY id DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def log_benchmark_scenario(
        self,
        dataset_name: str,
        scenario: str,
        stop_count: int,
        results_data: List[Dict[str, Any]]
    ) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO benchmark_logs (timestamp, dataset_name, scenario, stop_count, results_json)
                VALUES (?, ?, ?, ?, ?)
            """, (
                time.time(),
                dataset_name,
                scenario,
                stop_count,
                json.dumps(results_data)
            ))
            conn.commit()
            return cursor.lastrowid

    def get_benchmark_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM benchmark_logs ORDER BY id DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["results"] = json.loads(d["results_json"])
                results.append(d)
            return results

db_service = HistoryDBService()
