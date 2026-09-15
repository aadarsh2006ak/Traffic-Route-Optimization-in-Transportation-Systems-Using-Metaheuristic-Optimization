# backend/app/services/cv_hazard_service.py
import math
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple

class RoadHazardCVService:
    """
    Computer Vision (CV) & Road Incident Intelligence Service.
    Processes CCTV/camera feeds, detects potholes, road damage, waterlogging, and accidents,
    and calculates spatial edge intersections for dynamic route re-optimization.
    """
    def __init__(self):
        # In-memory store of currently active hazards
        self.hazards_db: Dict[str, Dict[str, Any]] = {}

        # Initialize with realistic demo incidents
        self._init_demo_hazards()

    def _init_demo_hazards(self):
        """Seed initial real-world hazard points."""
        demo_items = [
            {
                "hazard_id": "hz_demo_accident",
                "title": "Major Multi-Vehicle Collision",
                "hazard_type": "ACCIDENT",
                "location": (28.6250, 77.2150),  # Central Delhi near CP
                "severity": 0.95,                 # 0.0 to 1.0 (0.95 = severe road blockage)
                "radius_km": 0.8,
                "is_blocked": True,
                "description": "2-lane road blockage reported by CCTV Camera #14. High congestion.",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "confidence": 0.94,
                "bbox": [120, 85, 340, 260],     # [x, y, w, h]
                "camera_id": "CAM_DEL_CP_04"
            },
            {
                "hazard_id": "hz_demo_pothole",
                "title": "Severe Pothole Cluster & Road Degradation",
                "hazard_type": "POTHOLE_CLUSTER",
                "location": (28.5800, 77.2300),  # South Delhi
                "severity": 0.55,
                "radius_km": 0.5,
                "is_blocked": False,
                "description": "Deep asphalt fractures causing speed drop to <15 km/h.",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "confidence": 0.88,
                "bbox": [210, 160, 180, 110],
                "camera_id": "CAM_DEL_S_12"
            }
        ]
        for item in demo_items:
            self.hazards_db[item["hazard_id"]] = item

    def detect_from_image_meta(
        self,
        image_name: str,
        location: Tuple[float, float],
        camera_id: Optional[str] = "CAM_LIVE_01",
        hazard_type: Optional[str] = None,
        severity: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Simulates Computer Vision neural network inference (YOLOv8 / Vision Transformer)
        on an uploaded CCTV/dashcam frame or video stream.
        """
        hazard_id = f"hz_{uuid.uuid4().hex[:8]}"
        
        # Determine classification & confidence
        if not hazard_type:
            name_lower = image_name.lower()
            if "accident" in name_lower or "crash" in name_lower:
                hazard_type = "ACCIDENT"
                sev = severity if severity is not None else 0.92
                is_blocked = True
                conf = 0.95
                title = "Live Collision Detected"
                desc = "Vehicle collision detected via YOLOv8 model. Road passage obstructed."
                bbox = [140, 95, 320, 240]
            elif "water" in name_lower or "flood" in name_lower:
                hazard_type = "WATERLOGGING"
                sev = severity if severity is not None else 0.75
                is_blocked = False
                conf = 0.91
                title = "Severe Waterlogging on Roadway"
                desc = "Deep standing water detected. Significant speed reduction required."
                bbox = [80, 180, 480, 200]
            elif "construction" in name_lower or "work" in name_lower:
                hazard_type = "CONSTRUCTION"
                sev = severity if severity is not None else 0.65
                is_blocked = False
                conf = 0.89
                title = "Active Road Construction Work"
                desc = "Lane closure and heavy machinery active."
                bbox = [190, 110, 260, 220]
            else:
                hazard_type = "POTHOLE_CLUSTER"
                sev = severity if severity is not None else 0.60
                is_blocked = False
                conf = 0.87
                title = "Road Surface Degradation / Potholes"
                desc = "Multiple deep potholes identified on lane surface."
                bbox = [230, 210, 160, 90]
        else:
            sev = severity if severity is not None else 0.80
            is_blocked = (sev >= 0.85)
            conf = 0.92
            title = f"{hazard_type.replace('_', ' ').title()} Alert"
            desc = f"Computer Vision detection classified as {hazard_type} with severity {sev * 100:.0f}%."
            bbox = [150, 120, 300, 200]

        hazard_item = {
            "hazard_id": hazard_id,
            "title": title,
            "hazard_type": hazard_type,
            "location": (float(location[0]), float(location[1])),
            "severity": float(sev),
            "radius_km": 0.6 if not is_blocked else 0.9,
            "is_blocked": is_blocked,
            "description": desc,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "confidence": conf,
            "bbox": bbox,
            "camera_id": camera_id
        }

        self.hazards_db[hazard_id] = hazard_item
        return hazard_item

    def add_hazard(
        self,
        title: str,
        hazard_type: str,
        lat: float,
        lng: float,
        severity: float = 0.8,
        radius_km: float = 0.6,
        is_blocked: bool = False,
        description: str = "",
        camera_id: str = "MANUAL_REPORT"
    ) -> Dict[str, Any]:
        """Manually reports or injects an incident."""
        hazard_id = f"hz_{uuid.uuid4().hex[:8]}"
        item = {
            "hazard_id": hazard_id,
            "title": title,
            "hazard_type": hazard_type.upper(),
            "location": (float(lat), float(lng)),
            "severity": float(max(0.0, min(1.0, severity))),
            "radius_km": float(max(0.1, radius_km)),
            "is_blocked": is_blocked or (severity >= 0.90),
            "description": description or f"Incident of type {hazard_type} reported at {lat:.4f}, {lng:.4f}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "confidence": 0.98,
            "bbox": [100, 100, 200, 200],
            "camera_id": camera_id
        }
        self.hazards_db[hazard_id] = item
        return item

    def remove_hazard(self, hazard_id: str) -> bool:
        """Removes/resolves a hazard."""
        if hazard_id in self.hazards_db:
            del self.hazards_db[hazard_id]
            return True
        return False

    def get_active_hazards(self) -> List[Dict[str, Any]]:
        """Returns all currently active road hazards."""
        return list(self.hazards_db.values())

    def clear_all(self):
        """Clears all active hazards."""
        self.hazards_db.clear()

    @staticmethod
    def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates Great-Circle distance between two points in km."""
        R = 6371.0 # Earth's mean radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)

        a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @staticmethod
    def _point_to_segment_distance(
        p_lat: float, p_lon: float,
        a_lat: float, a_lon: float,
        b_lat: float, b_lon: float
    ) -> float:
        """
        Calculates minimum distance (in km) from point P to segment AB.
        """
        # Linear projection in local coordinates for fast geometric lookup
        dx = b_lon - a_lon
        dy = b_lat - a_lat
        seg_len_sq = dx * dx + dy * dy

        if seg_len_sq < 1e-12:
            return RoadHazardCVService._haversine_distance(p_lat, p_lon, a_lat, a_lon)

        t = ((p_lon - a_lon) * dx + (p_lat - a_lat) * dy) / seg_len_sq
        t = max(0.0, min(1.0, t))

        proj_lat = a_lat + t * dy
        proj_lon = a_lon + t * dx

        return RoadHazardCVService._haversine_distance(p_lat, p_lon, proj_lat, proj_lon)

    def calculate_edge_hazard_impact(
        self,
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> Tuple[float, bool, Optional[Dict[str, Any]]]:
        """
        Evaluates whether a traversal between (lat1, lon1) and (lat2, lon2)
        passes near any active CV road hazards.
        
        Returns:
            (penalty_multiplier, is_completely_blocked, highest_impact_hazard)
        """
        highest_penalty = 1.0
        is_blocked = False
        primary_hazard = None

        for hz in self.hazards_db.values():
            hz_lat, hz_lon = hz["location"]
            radius = hz.get("radius_km", 0.6)
            
            # Check shortest distance from hazard point to route segment
            min_dist = self._point_to_segment_distance(hz_lat, hz_lon, lat1, lon1, lat2, lon2)
            
            if min_dist <= radius:
                # Inside impact zone
                proximity_factor = 1.0 - (min_dist / max(radius, 0.01))
                
                if hz.get("is_blocked", False) or hz.get("severity", 0.0) >= 0.90:
                    is_blocked = True
                    highest_penalty = 1e6 # Extreme penalty to force complete detour
                    primary_hazard = hz
                    break # Fatal barrier
                else:
                    sev = hz.get("severity", 0.5)
                    # Speed reduction penalty multiplier (e.g. 1.5x to 4.0x traversal delay)
                    penalty = 1.0 + (sev * 3.0 * proximity_factor)
                    if penalty > highest_penalty:
                        highest_penalty = penalty
                        primary_hazard = hz

        return highest_penalty, is_blocked, primary_hazard

    def apply_hazards_to_matrices(
        self,
        dist_matrix: Any,
        time_matrix: Any,
        nodes: List[Dict[str, Any]]
    ) -> Tuple[Any, Any, List[Dict[str, Any]]]:
        """
        Adjusts distance and time matrices with CV hazard penalties.
        """
        import numpy as np
        n = len(nodes)
        adj_time = np.copy(time_matrix)
        adj_dist = np.copy(dist_matrix)
        affected_edges = []

        for i in range(n):
            coords_i = nodes[i].get("coords", (0.0, 0.0))
            for j in range(n):
                if i == j:
                    continue
                coords_j = nodes[j].get("coords", (0.0, 0.0))
                
                penalty_mult, is_blocked, hz = self.calculate_edge_hazard_impact(
                    coords_i[0], coords_i[1],
                    coords_j[0], coords_j[1]
                )

                if penalty_mult > 1.0 or is_blocked:
                    if is_blocked:
                        adj_time[i][j] *= 1e5
                        adj_dist[i][j] *= 1e5
                    else:
                        adj_time[i][j] *= penalty_mult
                    
                    if hz:
                        affected_edges.append({
                            "from_node": nodes[i].get("name", str(i)),
                            "to_node": nodes[j].get("name", str(j)),
                            "hazard_id": hz["hazard_id"],
                            "hazard_type": hz["hazard_type"],
                            "penalty_multiplier": round(penalty_mult, 2),
                            "is_blocked": is_blocked
                        })

        return adj_dist, adj_time, affected_edges

cv_hazard_service = RoadHazardCVService()
