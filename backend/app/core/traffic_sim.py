# backend/app/core/traffic_sim.py
import math
import numpy as np

class TrafficSimulator:
    """
    Traffic Congestion Simulation Engine based on Gaussian Peak-Hour modeling.
    Calculates time-of-day multipliers theta(t) and dynamic edge travel times.
    """
    def __init__(self):
        # Default peak periods: (mean_hour, std_dev, amplitude_alpha)
        # Morning Rush: 8:30 AM (8.5h), std=1.0h, max +70% delay
        # Evening Rush: 18:00 (18.0h), std=1.2h, max +80% delay
        # Midday Bump: 13:30 (13.5h), std=1.5h, max +25% delay
        self.peaks = [
            {"mu": 8.5, "sigma": 1.0, "alpha": 0.70},
            {"mu": 18.0, "sigma": 1.2, "alpha": 0.80},
            {"mu": 13.5, "sigma": 1.5, "alpha": 0.25}
        ]

    def get_congestion_factor(self, time_hour: float) -> float:
        """
        Calculates congestion factor theta(t) >= 1.0.
        theta(t) = 1.0 + sum( alpha_p * exp( - (t - mu_p)^2 / (2 * sigma_p^2) ) )
        """
        t = float(time_hour) % 24.0
        multiplier = 1.0
        for p in self.peaks:
            exponent = -((t - p["mu"]) ** 2) / (2.0 * (p["sigma"] ** 2))
            multiplier += p["alpha"] * math.exp(exponent)
        return multiplier

    def apply_traffic_to_matrix(self, time_matrix_hours: np.ndarray, departure_hour: float = 9.0) -> np.ndarray:
        """
        Adjusts free-flow travel time matrix with time-dependent congestion.
        """
        factor = self.get_congestion_factor(departure_hour)
        return time_matrix_hours * factor

    def get_traffic_status(self, congestion_factor: float) -> dict:
        """
        Returns human-readable status and hex color for UI visualization.
        """
        if congestion_factor > 1.5:
            return {"level": "Heavy Congestion", "color": "#ff2b2b", "multiplier": round(congestion_factor, 2)}
        elif congestion_factor > 1.2:
            return {"level": "Moderate Delay", "color": "#ff9100", "multiplier": round(congestion_factor, 2)}
        else:
            return {"level": "Smooth Flow", "color": "#00e5ff", "multiplier": round(congestion_factor, 2)}

traffic_sim = TrafficSimulator()
