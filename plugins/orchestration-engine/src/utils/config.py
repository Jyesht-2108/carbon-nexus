"""Configuration management for Orchestration Engine."""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Service URLs
    ml_engine_url: str = os.getenv("ML_ENGINE_URL", "http://localhost:8001")
    data_core_url: str = os.getenv("DATA_CORE_URL", "http://localhost:8002")
    rag_service_url: str = os.getenv("RAG_SERVICE_URL", "http://localhost:4000")
    
    # API Configuration
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    
    # Hotspot Thresholds
    threshold_info: float = float(os.getenv("THRESHOLD_INFO", "0.8"))
    threshold_warn: float = float(os.getenv("THRESHOLD_WARN", "1.0"))
    threshold_critical: float = float(os.getenv("THRESHOLD_CRITICAL", "1.5"))
    
    # Scheduler
    hotspot_check_interval: int = int(os.getenv("HOTSPOT_CHECK_INTERVAL", "300"))
    baseline_recalc_interval: int = int(os.getenv("BASELINE_RECALC_INTERVAL", "3600"))
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"


settings = Settings()
