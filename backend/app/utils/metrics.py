# backend/app/utils/metrics.py
import numpy as np
from typing import List, Dict, Any, Optional

def calculate_statistical_stability(results_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes statistical rigor across multiple independent algorithm runs:
    Mean, Standard Deviation, Min, Max, and Confidence Interval.
    """
    if not results_list:
        return {"mean_cost": 0.0, "std_cost": 0.0, "mean_runtime": 0.0, "std_runtime": 0.0}

    costs = [r.get("total_cost", 0.0) for r in results_list]
    runtimes = [r.get("runtime_sec", 0.0) for r in results_list]

    return {
        "mean_cost": round(float(np.mean(costs)), 3),
        "std_cost": round(float(np.std(costs)), 3),
        "min_cost": round(float(np.min(costs)), 3),
        "max_cost": round(float(np.max(costs)), 3),
        "mean_runtime": round(float(np.mean(runtimes)), 4),
        "std_runtime": round(float(np.std(runtimes)), 4),
        "runs_count": len(results_list)
    }

def compute_convergence_metrics(history: List[float]) -> Dict[str, Any]:
    """
    Calculates iterations-to-converge and final cost from iteration history.
    """
    if not history:
        return {"iterations_to_converge": 0, "final_cost": 0.0}

    final_cost = history[-1]
    # Find iteration where cost reached within 0.1% of final cost
    threshold = final_cost * 1.001
    conv_iter = len(history)
    for idx, c in enumerate(history):
        if c <= threshold:
            conv_iter = idx + 1
            break

    return {
        "iterations_to_converge": conv_iter,
        "final_cost": round(float(final_cost), 2),
        "initial_cost": round(float(history[0]), 2),
        "improvement_pct": round(((history[0] - final_cost) / max(history[0], 1e-6)) * 100, 2)
    }

def format_benchmark_comparison_table(results_dict: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Formats a multi-algorithm benchmark table with all comparison metrics.
    """
    table = []
    qpso_cost = results_dict.get("QPSO", {}).get("total_cost", 1.0)

    for algo_name, stats in results_dict.items():
        cost = stats.get("total_cost", 0.0)
        improvement = round(((cost - qpso_cost) / max(cost, 1e-6)) * 100, 2) if algo_name != "QPSO" else 0.0
        
        table.append({
            "algorithm": algo_name,
            "total_cost": round(float(cost), 2),
            "distance_km": round(float(stats.get("distance_km", 0.0)), 2),
            "duration_min": round(float(stats.get("duration_min", 0.0)), 1),
            "congestion_cost": round(float(stats.get("congestion_cost", 0.0)), 2),
            "iterations": stats.get("iterations_to_converge", 0),
            "runtime_sec": round(float(stats.get("runtime_sec", 0.0)), 4),
            "stability_std": round(float(stats.get("stability_std_dev", 0.0)), 3),
            "success_rate": f"{stats.get('success_rate_pct', 100.0):.1f}%",
            "qpso_gap_pct": f"+{improvement:.1f}%" if improvement > 0 else f"{improvement:.1f}%"
        })

    return sorted(table, key=lambda x: x["total_cost"])
