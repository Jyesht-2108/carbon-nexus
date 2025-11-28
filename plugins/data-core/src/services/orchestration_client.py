"""
Orchestration Engine HTTP Client
Provides functions to send notifications and updates to Orchestration Engine
"""
import httpx
from typing import Dict, Any
from ..utils.config import ORCHESTRATION_URL

class OrchestrationClient:
    """Client for Orchestration Engine API"""
    
    def __init__(self):
        self.base_url = ORCHESTRATION_URL
        self.timeout = 30.0
    
    async def notify_data_ready(self, event_ids: list) -> Dict[str, Any]:
        """
        Notify orchestration that new data is ready for processing
        
        Args:
            event_ids: List of event IDs that are ready
        
        Returns:
            Dict with acknowledgment
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/notifications/data-ready",
                json={"event_ids": event_ids}
            )
            response.raise_for_status()
            return response.json()
    
    async def report_data_quality(self, quality_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Report data quality metrics to orchestration
        
        Args:
            quality_data: Dict with supplier_id, completeness_pct, etc.
        
        Returns:
            Dict with acknowledgment
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/data-quality/report",
                json=quality_data
            )
            response.raise_for_status()
            return response.json()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Orchestration Engine health status"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            return response.json()

# Singleton instance
orchestration_client = OrchestrationClient()
