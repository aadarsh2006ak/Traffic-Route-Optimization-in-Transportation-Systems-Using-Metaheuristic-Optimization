# backend/app/benchmarking/convergence_plot.py
from typing import Dict, List, Any
import pandas as pd
import numpy as np

def build_convergence_dataframe(
    convergence_histories: Dict[str, List[float]],
    max_steps: int = 100
) -> pd.DataFrame:
    """
    Normalizes and samples multi-algorithm convergence curves into a unified pandas DataFrame.
    """
    if not convergence_histories:
        return pd.DataFrame({"Iteration": [0]})

    sampled_data = {}
    normalized_x = np.linspace(0, 100, max_steps)

    for algo_name, history in convergence_histories.items():
        if not history:
            sampled_data[algo_name] = [0.0] * max_steps
            continue

        orig_x = np.linspace(0, 100, len(history))
        # Interpolate to common x-axis for fair multi-algorithm visualization
        sampled_y = np.interp(normalized_x, orig_x, history)
        sampled_data[algo_name] = sampled_y

    df = pd.DataFrame(sampled_data)
    df.insert(0, "Normalized Progress (%)", np.round(normalized_x, 1))
    return df
