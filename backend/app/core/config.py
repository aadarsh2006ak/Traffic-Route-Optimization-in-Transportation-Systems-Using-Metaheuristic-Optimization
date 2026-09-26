# backend/app/core/config.py
import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuantumRoute - SIH 2026 PS 26137"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "2.0.0"
    ORGANIZATION: str = "Egreen Quanta"
    PROBLEM_STATEMENT_ID: str = "26137"
    
    # Database Configuration (PostgreSQL with SQLite fallback)
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "quantumroute")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    DATABASE_URL: Optional[str] = os.getenv(
        "DATABASE_URL",
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_SERVER', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'quantumroute')}"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./quantumroute.db"
    
    # QPSO Default Hyperparameters (Delta Potential Well Model)
    QPSO_DEFAULT_SWARM_SIZE: int = 40
    QPSO_DEFAULT_MAX_ITER: int = 500
    QPSO_BETA_MAX: float = 1.0
    QPSO_BETA_MIN: float = 0.5
    
    # Dynamic Road Network Weight Coefficients w(i, j, t) = alpha*dist + beta*time + gamma*congestion
    WEIGHT_ALPHA: float = 0.4   # Distance weight
    WEIGHT_BETA: float = 0.4    # Travel time weight
    WEIGHT_GAMMA: float = 0.2   # Congestion weight
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
