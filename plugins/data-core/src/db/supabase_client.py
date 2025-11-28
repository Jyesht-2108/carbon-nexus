from supabase import create_client, Client
from src.utils.config import settings
from src.utils.logger import logger
from typing import Dict, List, Any, Optional


class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
        logger.info("Supabase client initialized")
    
    def insert_raw_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Insert raw event into events_raw table"""
        try:
            result = self.client.table("events_raw").insert(event).execute()
            logger.debug(f"Inserted raw event: {event.get('id', 'unknown')}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error inserting raw event: {e}")
            raise
    
    def insert_normalized_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Insert normalized event into events_normalized table"""
        try:
            result = self.client.table("events_normalized").insert(event).execute()
            logger.debug(f"Inserted normalized event: {event.get('id', 'unknown')}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error inserting normalized event: {e}")
            raise
    
    def insert_quality_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Insert data quality metrics"""
        try:
            result = self.client.table("data_quality").insert(metrics).execute()
            logger.debug(f"Inserted quality metrics for supplier: {metrics.get('supplier_id')}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error inserting quality metrics: {e}")
            raise
    
    def get_supplier_baseline(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        """Get baseline data for a supplier"""
        try:
            result = self.client.table("suppliers").select("*").eq("id", supplier_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error fetching supplier baseline: {e}")
            return None
    
    def insert_ingest_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """Insert ingest job tracking record"""
        try:
            result = self.client.table("ingest_jobs").insert(job).execute()
            logger.info(f"Created ingest job: {job.get('job_id')}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating ingest job: {e}")
            raise
    
    def update_ingest_job(self, job_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update ingest job status"""
        try:
            result = self.client.table("ingest_jobs").update(updates).eq("job_id", job_id).execute()
            logger.debug(f"Updated ingest job {job_id}: {updates.get('status')}")
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error updating ingest job: {e}")
            raise
    
    def get_ingest_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get ingest job by ID"""
        try:
            result = self.client.table("ingest_jobs").select("*").eq("job_id", job_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error fetching ingest job: {e}")
            return None


# Singleton instance
supabase_client = SupabaseClient()
