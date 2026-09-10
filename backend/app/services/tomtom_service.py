# backend/app/services/tomtom_service.py
import os
import requests
from typing import List, Tuple, Optional

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY", "")

class TomTomService:
    """
    TomTom live traffic routing service for enterprise-grade real-time ETAs and geometry.
    """
    def __init__(self, api_key: str = ""):
        self.api_key = api_key or TOMTOM_API_KEY

    def get_live_traffic_route(
        self,
        coords: List[Tuple[float, float]]
    ) -> Optional[Tuple[List[List[float]], float, float]]:
        """
        Calculates optimal traffic-aware route using TomTom Routing API v1.
        Returns: (points [[lat, lon], ...], length_km, travel_time_mins) or None
        """
        if not self.api_key or len(coords) < 2:
            return None

        try:
            loc_string = ":".join([f"{lat},{lon}" for lat, lon in coords])
            url = f"https://api.tomtom.com/routing/1/calculateRoute/{loc_string}/json"
            params = {
                "key": self.api_key,
                "traffic": "true",
                "routeType": "fastest",
                "travelMode": "car"
            }
            r = requests.get(url, params=params, timeout=5)
            if r.status_code == 200:
                data = r.json()
                routes = data.get("routes", [])
                if routes:
                    summary = routes[0]["summary"]
                    legs = routes[0]["legs"]
                    points = []
                    for leg in legs:
                        for p in leg["points"]:
                            points.append([p["latitude"], p["longitude"]])
                    return (
                        points,
                        summary["lengthInMeters"] / 1000.0,
                        summary["travelTimeInSeconds"] / 60.0
                    )
        except Exception:
            pass
        return None

tomtom_service = TomTomService()
