# backend/app/graph/traffic_simulator.py
import math
import numpy as np
from typing import Dict, Any, List

class TrafficSimulator:
    """
    Simulates dynamic, time-varying road network congestion weights w(i, j, t):
    w(i, j, t) = alpha * distance(i, j) + beta * travel_time(i, j, t) + gamma * congestion(i, j, t)
    
    Models multi-peak urban rush hours (Morning 8:30 AM, Evening 6:00 PM, Midday 1:30 PM)
    using Gaussian mixture distributions.
    """
    def __init__(self):
        self.peaks = [
            {"mu": 8.5, "sigma": 1.0, "alpha": 0.75, "name": "Morning Rush"},
            {"mu": 18.0, "sigma": 1.2, "alpha": 0.85, "name": "Evening Rush"},
            {"mu": 13.5, "sigma": 1.5, "alpha": 0.30, "name": "Midday Logistics"}
        ]

    def get_congestion_factor(self, time_hour: float) -> float:
        """
        Calculates time-dependent multiplier theta(t) >= 1.0
        theta(t) = 1.0 + sum_p ( alpha_p * exp( - (t - mu_p)^2 / (2 * sigma_p^2) ) )
        """
        t = float(time_hour) % 24.0
        multiplier = 1.0
        for p in self.peaks:
            exponent = -((t - p["mu"]) ** 2) / (2.0 * (p["sigma"] ** 2))
            multiplier += p["alpha"] * math.exp(exponent)
        return float(multiplier)

    def compute_edge_weight(
        self,
        dist_km: float,
        travel_time_hr: float,
        cong_multiplier: float,
        alpha: float = 0.4,
        beta: float = 0.4,
        gamma: float = 0.2,
        cost_scale_km: float = 8.0,
        cost_scale_hr: float = 50.0
    ) -> float:
        """
        Composite weight w(i, j, t) = alpha * d + beta * t + gamma * c
        """
        dist_term = dist_km * cost_scale_km
        time_term = travel_time_hr * cost_scale_hr
        cong_term = (cong_multiplier - 1.0) * travel_time_hr * cost_scale_hr * 2.0
        
        composite = (alpha * dist_term) + (beta * time_term) + (gamma * max(0.0, cong_term))
        return float(composite)

    def get_24h_profile(self) -> List[Dict[str, Any]]:
        """
        Generates complete 24-hour congestion curve profile for UI charts.
        """
        profile = []
        for step in range(48):
            h = step * 0.5
            theta = self.get_congestion_factor(h)
            profile.append({
                "hour": round(h, 1),
                "time_label": f"{int(h):02d}:{int((h % 1) * 60):02d}",
                "congestion_multiplier": round(theta, 3),
                "delay_pct": round((theta - 1.0) * 100, 1),
                "status": "Heavy" if theta > 1.5 else ("Moderate" if theta > 1.2 else "Smooth")
            })
        return profile

traffic_simulator = TrafficSimulator()
