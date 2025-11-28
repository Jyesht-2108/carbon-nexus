"""Alert API routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..db.supabase_client import db_client
from ..utils.logger import logger

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
async def get_alerts(
    level: Optional[str] = Query(None, description="Filter by level"),
    limit: int = Query(20, ge=1, le=100)
) -> List[Dict[str, Any]]:
    """Get alerts with optional filters."""
    try:
        # Get all alerts from database
        response = db_client.client.table("alerts")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        alerts = response.data
        
        # Apply level filter if provided
        if level:
            alerts = [a for a in alerts if a.get("level") == level]
        
        return alerts
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/critical")
async def get_critical_alerts(limit: int = Query(10, ge=1, le=50)) -> List[Dict[str, Any]]:
    """Get critical alerts only."""
    try:
        response = db_client.client.table("alerts")\
            .select("*")\
            .eq("level", "critical")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return response.data
        
    except Exception as e:
        logger.error(f"Error getting critical alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_alert_stats() -> Dict[str, Any]:
    """Get alert statistics."""
    try:
        response = db_client.client.table("alerts")\
            .select("*")\
            .execute()
        
        alerts = response.data
        
        stats = {
            "total": len(alerts),
            "by_level": {
                "critical": len([a for a in alerts if a.get("level") == "critical"]),
                "warn": len([a for a in alerts if a.get("level") == "warn"]),
                "info": len([a for a in alerts if a.get("level") == "info"])
            }
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting alert stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
