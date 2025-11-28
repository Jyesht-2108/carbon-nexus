"""RAG Chatbot client for recommendations."""
import httpx
from typing import Dict, Any, Optional, List
from ..utils.config import settings
from ..utils.logger import logger


class RAGClient:
    """Client for RAG Chatbot service."""
    
    def __init__(self):
        """Initialize RAG client."""
        self.base_url = settings.rag_service_url
        self.timeout = 60.0  # RAG can take longer due to AI processing
    
    async def generate_recommendations(
        self,
        supplier: str,
        predicted: float,
        baseline: float,
        hotspot_reason: Optional[str] = None,
        hotspot_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """Generate recommendations for a hotspot."""
        try:
            payload = {
                "supplier": supplier,
                "predicted": predicted,
                "baseline": baseline
            }
            
            if hotspot_reason:
                payload["hotspot_reason"] = hotspot_reason
            if hotspot_id:
                payload["hotspot_id"] = hotspot_id
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/rag/recommend",
                    json=payload
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"RAG recommendation generation error: {e}")
            return None
    
    async def get_recommendations(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recommendations from RAG service."""
        try:
            url = f"{self.base_url}/api/recommendations"
            if status:
                url += f"?status={status}"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching recommendations: {e}")
            return []
    
    async def update_recommendation_status(self, rec_id: int, status: str) -> bool:
        """Update recommendation status."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.patch(
                    f"{self.base_url}/api/recommendations/{rec_id}",
                    json={"status": status}
                )
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Error updating recommendation status: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Check if RAG service is healthy."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False


# Singleton instance
rag_client = RAGClient()
