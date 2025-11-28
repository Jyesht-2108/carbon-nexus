from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_key: str
    
    # API Config
    api_host: str = "0.0.0.0"
    api_port: int = 8002
    
    # Data Processing
    max_file_size_mb: int = 50
    outlier_method: str = "iqr"
    iqr_multiplier: float = 1.5
    
    # Gap Filling
    gap_fill_confidence_threshold: float = 0.5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
