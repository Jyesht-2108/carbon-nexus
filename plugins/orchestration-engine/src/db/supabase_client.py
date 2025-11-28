"""Supabase database client."""
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from ..utils.config import settings
from ..utils.logger import logger


class SupabaseClient:
    """Supabase database client for orchestration engine."""
    
    def __init__(self):
        """Initialize Supabase client."""
        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
        logger.info("Supabase client initialized")
    
    async def get_recent_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent normalized events."""
        try:
            response = self.client.table("events_normalized")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching events: {e}")
            return []
    
    async def get_events_without_predictions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get events that don't have predictions yet."""
        try:
            # Get events that aren't in predictions table
            response = self.client.table("events_normalized")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching unpredicted events: {e}")
            return []
    
    async def insert_prediction(self, prediction: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert ML prediction."""
        try:
            response = self.client.table("predictions").insert(prediction).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error inserting prediction: {e}")
            return None
    
    async def insert_hotspot(self, hotspot: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert detected hotspot."""
        try:
            response = self.client.table("hotspots").insert(hotspot).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error inserting hotspot: {e}")
            return None
    
    async def insert_alert(self, alert: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert alert."""
        try:
            response = self.client.table("alerts").insert(alert).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error inserting alert: {e}")
            return None
    
    async def get_baseline(self, entity: str, entity_type: str) -> Optional[float]:
        """Get baseline emission for entity."""
        try:
            response = self.client.table("baselines")\
                .select("baseline_value")\
                .eq("entity", entity)\
                .eq("entity_type", entity_type)\
                .execute()
            
            if response.data:
                return response.data[0]["baseline_value"]
            return None
        except Exception as e:
            logger.error(f"Error fetching baseline: {e}")
            return None
    
    async def upsert_baseline(self, baseline: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert or update baseline."""
        try:
            response = self.client.table("baselines").upsert(baseline).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error upserting baseline: {e}")
            return None
    
    async def get_active_hotspots(self) -> List[Dict[str, Any]]:
        """Get currently active hotspots."""
        try:
            response = self.client.table("hotspots")\
                .select("*")\
                .eq("status", "active")\
                .order("created_at", desc=True)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching hotspots: {e}")
            return []
    
    async def get_recommendations(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recommendations, optionally filtered by status."""
        try:
            query = self.client.table("recommendations").select("*")
            if status:
                query = query.eq("status", status)
            response = query.order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching recommendations: {e}")
            return []
    
    async def update_recommendation_status(self, rec_id: int, status: str) -> bool:
        """Update recommendation status."""
        try:
            self.client.table("recommendations")\
                .update({"status": status})\
                .eq("id", rec_id)\
                .execute()
            return True
        except Exception as e:
            logger.error(f"Error updating recommendation: {e}")
            return False
    
    async def insert_audit_log(self, log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert audit log entry."""
        try:
            response = self.client.table("audit_logs").insert(log).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error inserting audit log: {e}")
            return None


# Singleton instance
db_client = SupabaseClient()
