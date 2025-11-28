"""
RAG Chatbot HTTP Client
Provides functions to request recommendations and root cause analysis
"""
import httpx
from typing import Dict, Any, List, Optional
from ..utils.config import RAG_URL

class RAGClient:
    """Client for RAG Chatbot API"""
    
    def __init__(self):
        self.base_url = RAG_URL
        self.timeout = 60.0  # RAG may take longer
    
    async def request_recommendations(
        self,
        hotspot_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Request recommendations for a hotspot
        
        Args:
            hotspot_data: Dict with entity, predicted, baseline, context
        
        Returns:
            Dict with root_cause and actions list
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/recommendations",
                json=hotspot_data
            )
            response.raise_for_status()
            return response.json()
    
    async def analyze_root_cause(
        self,
        entity: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze root cause of emission spike
        
        Args:
            entity: Entity identifier (supplier, facility, etc.)
            data: Context data for analysis
        
        Returns:
            Dict with root_cause analysis
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/analyze",
                json={"entity": entity, "data": data}
            )
            response.raise_for_status()
            return response.json()
    
    async def chat(self, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Send a chat message to RAG chatbot
        
        Args:
            message: User message
            context: Optional context data
        
        Returns:
            Dict with response and sources
        """
        payload = {"message": message}
        if context:
            payload["context"] = context
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check RAG service health status"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            return response.json()

# Singleton instance
rag_client = RAGClient()
