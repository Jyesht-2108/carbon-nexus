"""
Configuration loader for ML Engine
Loads environment variables from .env file
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Service URLs
ML_ENGINE_URL = os.getenv('ML_ENGINE_URL', 'http://localhost:8001')
DATA_CORE_URL = os.getenv('DATA_CORE_URL', 'http://localhost:8002')
ORCHESTRATION_URL = os.getenv('ORCHESTRATION_URL', 'http://localhost:8003')
RAG_URL = os.getenv('RAG_URL', 'http://localhost:8004')

# Database
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

# Validate required variables
def validate_config():
    """Validate that required environment variables are set"""
    if not SUPABASE_URL:
        print("Warning: SUPABASE_URL not set")
    if not SUPABASE_KEY:
        print("Warning: SUPABASE_KEY not set")

# Auto-validate on import
validate_config()
