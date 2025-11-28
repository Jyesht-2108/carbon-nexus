"""
Data Core HTTP Client
Provides functions to fetch normalized data from Data Core
"""
import httpx
from typing import Dict, Any, List, Optional
from ..utils.config import DATA_CORE_URL

class DataCoreClient:
    """Client for Data Core API"""
    
    def __init__(self):
        self.base_url = DATA_CORE_URL
        self.timeout = 30.0
    
    async def fetch_normalized_events(
        self, 
        limit: int = 100,
        offset: int = 0,
        supplier_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch normalized events from Data Core
        
        Args:
            limit: Maximum number of events to fetch
            offset: Offset for pagination
            supplier_id: Optional filter by supplier
        
        Returns:
            List of normalized event dictionaries
        """
        params = {"limit": limit, "offset": offset}
        if supplier_id:
            params["supplier_id"] = supplier_id
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/api/events/normalized",
                params=params
            )
            response.raise_for_status()
            return response.json()
    
    async def fetch_data_quality(self, supplier_id: str) -> Dict[str, Any]:
        """
        Fetch data quality metrics for a supplier
        
        Args:
            supplier_id: Supplier identifier
        
        Returns:
            Dict with completeness_pct, predicted_pct, anomalies_count
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/api/data-quality/{supplier_id}"
            )
            response.raise_for_status()
            return response.json()
    
    async def ingest_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a single event to Data Core for ingestion
        
        Args:
            event_data: Event data dictionary
        
        Returns:
            Dict with status and event_id
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/ingest/event",
                json=event_data
            )
            response.raise_for_status()
            return response.json()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Data Core health status"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            return response.json()

# Singleton instance
data_core_client = DataCoreClient()
