# backend/app/benchmarking/metrics.py
from typing import List, Dict, Any
import numpy as np

def calculate_benchmark_metrics(
    results: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Computes comparative metrics across benchmarked algorithms:
    - Distance (km)
    - Total Cost / Energy
    - Execution Time (s)
    - Iterations to Converge
    - Optimality Gap (% gap from best found solution)
    """
    if not results:
        return []

    best_dist = min(r.get("distance_km", np.inf) for r in results)

    summary = []
    for r in results:
        dist = r.get("distance_km", 0.0)
        gap_pct = ((dist - best_dist) / max(best_dist, 1e-6)) * 100.0 if best_dist > 0 else 0.0

        summary.append({
            "Algorithm": r.get("algorithm", "Unknown"),
            "Distance (km)": round(dist, 2),
            "Duration (min)": round(r.get("duration_min", 0.0), 1),
            "Runtime (s)": round(r.get("runtime_sec", 0.0), 4),
            "Iterations": r.get("iterations", 0),
            "Quantum Tunnels": r.get("tunnels", 0),
            "Gap from Best (%)": f"+{gap_pct:.2f}%" if gap_pct > 0.001 else "0.00% (Best)",
            "Feasible": "✅ Feasible" if r.get("is_feasible", True) else "❌ Infeasible"
        })

    return summary
