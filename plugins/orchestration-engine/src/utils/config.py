"""
Configuration loader for Orchestration Engine
Loads environment variables from .env file
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file from project root
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8003
    log_level: str = "INFO"
    
    # Service URLs
    ml_engine_url: str = "http://localhost:8001"
    data_core_url: str = "http://localhost:8002"
    rag_service_url: str = "http://localhost:8004"
    
    # Database
    supabase_url: str = ""
    supabase_key: str = ""  # Changed from supabase_service_key to match .env
    
    # Hotspot Detection Thresholds
    threshold_info: float = 1.1
    threshold_warn: float = 1.3
    threshold_critical: float = 1.5
    
    # Scheduler Settings
    hotspot_check_interval: int = 300  # 5 minutes in seconds
    prediction_interval: int = 600  # 10 minutes in seconds
    baseline_recalc_interval: int = 3600  # 1 hour in seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env


# Create settings instance
settings = Settings()

# Legacy variables for backward compatibility
ML_ENGINE_URL = settings.ml_engine_url
DATA_CORE_URL = settings.data_core_url
ORCHESTRATION_URL = f"http://{settings.api_host}:{settings.api_port}"
RAG_URL = settings.rag_service_url
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_key


# Validate required variables
def validate_config():
    """Validate that required environment variables are set"""
    if not settings.supabase_url:
        print("Warning: SUPABASE_URL not set")
    if not settings.supabase_key:
        print("Warning: SUPABASE_KEY not set")


# Auto-validate on import
validate_config()
