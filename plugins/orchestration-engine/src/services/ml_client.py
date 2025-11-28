"""ML Engine client for predictions."""
import httpx
from typing import Dict, Any, Optional
from ..utils.config import settings
from ..utils.logger import logger


class MLClient:
    """Client for ML Engine service."""
    
    def __init__(self):
        """Initialize ML client."""
        self.base_url = settings.ml_engine_url
        self.timeout = 30.0
    
    async def predict_logistics(self, features: Dict[str, Any]) -> Optional[float]:
        """Get logistics CO2 prediction."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/predict/logistics",
                    json=features
                )
                response.raise_for_status()
                data = response.json()
                return data.get("co2_kg")
        except Exception as e:
            logger.error(f"ML Engine logistics prediction error: {e}")
            return None
    
    async def predict_factory(self, features: Dict[str, Any]) -> Optional[float]:
        """Get factory CO2 prediction."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/predict/factory",
                    json=features
                )
                response.raise_for_status()
                data = response.json()
                return data.get("co2_kg")
        except Exception as e:
            logger.error(f"ML Engine factory prediction error: {e}")
            return None
    
    async def predict_warehouse(self, features: Dict[str, Any]) -> Optional[float]:
        """Get warehouse CO2 prediction."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/predict/warehouse",
                    json=features
                )
                response.raise_for_status()
                data = response.json()
                return data.get("co2_kg")
        except Exception as e:
            logger.error(f"ML Engine warehouse prediction error: {e}")
            return None
    
    async def predict_delivery(self, features: Dict[str, Any]) -> Optional[float]:
        """Get delivery CO2 prediction."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/predict/delivery",
                    json=features
                )
                response.raise_for_status()
                data = response.json()
                return data.get("co2_kg")
        except Exception as e:
            logger.error(f"ML Engine delivery prediction error: {e}")
            return None
    
    async def forecast_7d(self, history: list) -> Optional[Dict[str, Any]]:
        """Get 7-day forecast."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/forecast/7d",
                    json={"history": history}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"ML Engine forecast error: {e}")
            return None
    
    async def health_check(self) -> bool:
        """Check if ML Engine is healthy."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False


# Singleton instance
ml_client = MLClient()
