# backend/app/services/osrm_service.py
import os
import requests
import numpy as np
from geopy.distance import geodesic
from typing import List, Dict, Any, Tuple

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://router.project-osrm.org")

class OSRMService:
    """
    Handles communication with Open Source Routing Machine (OSRM)
    and provides fallback Geodesic distance/duration matrix calculations.
    """
    @staticmethod
    def build_matrices(nodes: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Creates Distance (km) and Duration (hours) matrices.
        Returns: (dist_matrix_km, time_matrix_hours)
        """
        n = len(nodes)
        if n == 0:
            return np.zeros((0, 0)), np.zeros((0, 0))

        # Try OSRM Table API
        try:
            coords_str = ";".join([f"{node['coords'][1]},{node['coords'][0]}" for node in nodes])
            url = f"{OSRM_BASE_URL}/table/v1/driving/{coords_str}?annotations=distance,duration"
            response = requests.get(url, timeout=3.5)
            if response.status_code == 200:
                data = response.json()
                if "distances" in data and "durations" in data:
                    raw_dist = data["distances"]
                    raw_time = data["durations"]
                    clean_dist = [[99999.0 if x is None else x for x in row] for row in raw_dist]
                    clean_time = [[99999.0 if x is None else x for x in row] for row in raw_time]
                    return np.array(clean_dist) / 1000.0, np.array(clean_time) / 3600.0
        except Exception:
            pass

        # Fallback: Geodesic
        dist_matrix = np.zeros((n, n))
        time_matrix = np.zeros((n, n))
        for i in range(n):
            for j in range(n):
                if i != j:
                    d = geodesic(nodes[i]['coords'], nodes[j]['coords']).km
                    dist_matrix[i][j] = d
                    time_matrix[i][j] = d / 45.0 # Assume 45 km/h urban speed

        return dist_matrix, time_matrix

    @staticmethod
    def get_route_geometry(coords: List[Tuple[float, float]]) -> Tuple[List[List[float]], float, float]:
        """
        Fetches true driving geometry coordinates from OSRM.
        Returns: (path_geometry [[lat, lon], ...], total_km, total_minutes)
        """
        if len(coords) < 2:
            return [list(c) for c in coords], 0.0, 0.0

        loc_string = ";".join([f"{lon},{lat}" for lat, lon in coords])
        url = f"{OSRM_BASE_URL}/route/v1/driving/{loc_string}?overview=full&geometries=geojson"
        try:
            r = requests.get(url, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if 'routes' in data and len(data['routes']) > 0:
                    rt = data['routes'][0]
                    geometry = rt['geometry']['coordinates']
                    path_geo = [[p[1], p[0]] for p in geometry] # convert [lon, lat] -> [lat, lon]
                    return path_geo, rt['distance'] / 1000.0, rt['duration'] / 60.0
        except Exception:
            pass

        # Straight-line fallback
        total_km = sum(geodesic(coords[i], coords[i+1]).km for i in range(len(coords)-1))
        return [list(c) for c in coords], total_km, (total_km / 45.0) * 60.0

osrm_service = OSRMService()
