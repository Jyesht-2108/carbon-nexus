"""
ML Engine HTTP Client
Provides functions to call ML Engine prediction endpoints
"""
import httpx
from typing import Dict, Any, List
from ..utils.config import ML_ENGINE_URL

class MLClient:
    """Client for ML Engine API"""
    
    def __init__(self):
        self.base_url = ML_ENGINE_URL
        self.timeout = 30.0
    
    async def predict_logistics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict logistics CO2 emissions
        
        Args:
            data: Dict with distance_km, load_kg, vehicle_type, fuel_type, etc.
        
        Returns:
            Dict with co2_kg, model_version, confidence
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/predict/logistics",
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def predict_factory(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict factory CO2 emissions
        
        Args:
            data: Dict with energy_kwh, shift_hours, furnace_usage, etc.
        
        Returns:
            Dict with co2_kg, model_version, confidence
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/predict/factory",
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def predict_warehouse(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict warehouse CO2 emissions
        
        Args:
            data: Dict with temperature, energy_kwh, refrigeration_load, etc.
        
        Returns:
            Dict with co2_kg, model_version, confidence
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/predict/warehouse",
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def predict_delivery(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict delivery CO2 emissions
        
        Args:
            data: Dict with route_length, vehicle_type, traffic_score, etc.
        
        Returns:
            Dict with co2_kg, model_version, confidence
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/predict/delivery",
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def forecast_7d(self, history: List[float]) -> Dict[str, Any]:
        """
        Get 7-day CO2 forecast
        
        Args:
            history: List of historical daily emission values
        
        Returns:
            Dict with forecast, confidence_low, confidence_high
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/forecast/7d",
                json={"history": history}
            )
            response.raise_for_status()
            return response.json()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check ML Engine health status"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/v1/health")
            response.raise_for_status()
            return response.json()

# Singleton instance
ml_client = MLClient()
