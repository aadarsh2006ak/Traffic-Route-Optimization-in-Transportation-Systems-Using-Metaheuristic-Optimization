# backend/app/api/routes_hazard.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple
from ..services.cv_hazard_service import cv_hazard_service

router = APIRouter(prefix="/api/v1/hazards", tags=["Computer Vision & Road Hazards"])

class HazardReportRequest(BaseModel):
    title: str = Field(..., example="Major Truck Breakdown on Flyover")
    hazard_type: str = Field(default="ACCIDENT", example="ACCIDENT") # ACCIDENT, POTHOLE_CLUSTER, WATERLOGGING, CONSTRUCTION
    lat: float = Field(..., example=28.6129)
    lng: float = Field(..., example=77.2295)
    severity: float = Field(default=0.85, ge=0.0, le=1.0)
    radius_km: float = Field(default=0.6, ge=0.1, le=5.0)
    is_blocked: Optional[bool] = False
    description: Optional[str] = ""
    camera_id: Optional[str] = "CAM_MANUAL"

class ImageDetectRequest(BaseModel):
    image_name: str = Field(default="dashcam_frame_04.jpg")
    lat: float = Field(default=28.6139)
    lng: float = Field(default=77.2090)
    camera_id: Optional[str] = "CCTV_HUB_01"
    hazard_type: Optional[str] = None
    severity: Optional[float] = None

class RouteImpactRequest(BaseModel):
    nodes: List[Dict[str, Any]]

@router.get("/active")
def get_active_hazards():
    """
    Returns all currently active real-time hazards detected by CV cameras or reported by traffic sensors.
    """
    hazards = cv_hazard_service.get_active_hazards()
    return {
        "status": "success",
        "total_active_hazards": len(hazards),
        "hazards": hazards
    }

@router.post("/detect")
def detect_hazard_from_camera(request: ImageDetectRequest):
    """
    Executes Computer Vision Neural Network Inference (YOLOv8 / Vision Transformer)
    on a camera feed frame to detect road damage, potholes, waterlogging, or accidents.
    """
    result = cv_hazard_service.detect_from_image_meta(
        image_name=request.image_name,
        location=(request.lat, request.lng),
        camera_id=request.camera_id,
        hazard_type=request.hazard_type,
        severity=request.severity
    )
    return {
        "status": "success",
        "message": f"Computer Vision detection complete: {result['title']}",
        "detection": result
    }

@router.post("/report")
def report_hazard(request: HazardReportRequest):
    """
    Reports or simulates a road hazard at a specific geographical coordinate.
    """
    hazard = cv_hazard_service.add_hazard(
        title=request.title,
        hazard_type=request.hazard_type,
        lat=request.lat,
        lng=request.lng,
        severity=request.severity,
        radius_km=request.radius_km,
        is_blocked=request.is_blocked or (request.severity >= 0.90),
        description=request.description,
        camera_id=request.camera_id or "CAM_REPORT"
    )
    return {
        "status": "success",
        "message": "Hazard registered successfully and integrated into cost matrices.",
        "hazard": hazard
    }

@router.delete("/{hazard_id}")
def resolve_hazard(hazard_id: str):
    """
    Resolves/clears an active hazard after the road has been cleared.
    """
    removed = cv_hazard_service.remove_hazard(hazard_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Hazard ID not found.")
    return {
        "status": "success",
        "message": f"Hazard {hazard_id} marked as resolved."
    }

@router.post("/clear")
def clear_all_hazards():
    """
    Clears all active hazards.
    """
    cv_hazard_service.clear_all()
    return {
        "status": "success",
        "message": "All active road hazards cleared."
    }

@router.post("/presets/{preset_name}")
def load_preset_scenario(preset_name: str):
    """
    Loads realistic preset incident scenarios for demonstration and testing:
    - `accident_cp`: Major collision near Connaught Place (Complete road block)
    - `potholes_ring_road`: Severe road degradation on Ring Road (60% speed drop)
    - `waterlogging_minto`: Flooded underpass near Central Hub (80% delay)
    - `multi_incident`: Multiple simultaneous incidents across the logistics network
    """
    cv_hazard_service.clear_all()
    preset = preset_name.lower()
    
    if preset == "accident_cp":
        h = cv_hazard_service.add_hazard(
            title="💥 3-Car Collision at Connaught Place Outer Circle",
            hazard_type="ACCIDENT",
            lat=28.6315,
            lng=77.2167,
            severity=0.98,
            radius_km=0.9,
            is_blocked=True,
            description="CCTV CAM_DEL_CP_02 detected blocked lanes. Police & ambulance on scene.",
            camera_id="CAM_DEL_CP_02"
        )
        msg = "Major accident scenario loaded at Connaught Place."

    elif preset == "potholes_ring_road":
        h = cv_hazard_service.add_hazard(
            title="🕳️ Heavy Pothole Zone on South Ring Road",
            hazard_type="POTHOLE_CLUSTER",
            lat=28.5600,
            lng=77.2200,
            severity=0.65,
            radius_km=0.7,
            is_blocked=False,
            description="Dashcam telemetry detected deep craters. Speed restricted to 15 km/h.",
            camera_id="DASHCAM_FLEET_09"
        )
        msg = "Pothole degradation scenario loaded on Ring Road."

    elif preset == "waterlogging_minto":
        h = cv_hazard_service.add_hazard(
            title="🌊 Flooded Underpass near Minto Road",
            hazard_type="WATERLOGGING",
            lat=28.6400,
            lng=77.2300,
            severity=0.85,
            radius_km=0.6,
            is_blocked=False,
            description="3 feet water accumulation detected. Heavy vehicle delays.",
            camera_id="CAM_DEL_MINTO_01"
        )
        msg = "Waterlogging scenario loaded near Minto Road."

    elif preset == "multi_incident":
        cv_hazard_service.add_hazard(
            title="💥 Multi-Vehicle Crash near India Gate",
            hazard_type="ACCIDENT",
            lat=28.6129,
            lng=77.2295,
            severity=0.96,
            radius_km=0.8,
            is_blocked=True,
            description="Collision blocking North-South arterial corridor.",
            camera_id="CAM_DEL_IG_01"
        )
        cv_hazard_service.add_hazard(
            title="🕳️ Damaged Asphalt & Potholes near Hauz Khas",
            hazard_type="POTHOLE_CLUSTER",
            lat=28.5494,
            lng=77.2001,
            severity=0.60,
            radius_km=0.5,
            is_blocked=False,
            description="Severe surface fissures detected.",
            camera_id="CAM_DEL_HK_05"
        )
        msg = "Multi-incident network scenario loaded (Accident + Potholes)."
    else:
        # Default single accident
        cv_hazard_service._init_demo_hazards()
        msg = "Default demo hazard scenario loaded."

    return {
        "status": "success",
        "message": msg,
        "active_hazards": cv_hazard_service.get_active_hazards()
    }
