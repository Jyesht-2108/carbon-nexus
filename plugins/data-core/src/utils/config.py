"""
Configuration loader for Data Core
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
    api_port: int = 8002
    log_level: str = "INFO"
    
    # Service URLs
    ml_engine_url: str = "http://localhost:8001"
    orchestration_url: str = "http://localhost:8003"
    rag_service_url: str = "http://localhost:8004"
    
    # Database
    supabase_url: str = ""
    supabase_key: str = ""
    
    # Processing Settings
    batch_size: int = 100
    max_workers: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


# Create settings instance
settings = Settings()

# Legacy variables for backward compatibility
ML_ENGINE_URL = settings.ml_engine_url
DATA_CORE_URL = f"http://{settings.api_host}:{settings.api_port}"
ORCHESTRATION_URL = settings.orchestration_url
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
