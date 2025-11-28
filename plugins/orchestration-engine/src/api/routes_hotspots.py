"""Hotspot API routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..db.supabase_client import db_client
from ..services.hotspot_engine import hotspot_engine
from ..utils.logger import logger

router = APIRouter(prefix="/hotspots", tags=["hotspots"])


@router.get("")
async def get_hotspots(
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(20, ge=1, le=100)
) -> List[Dict[str, Any]]:
    """Get hotspots with optional filters."""
    try:
        hotspots = await db_client.get_active_hotspots()
        
        # Apply filters
        if status:
            hotspots = [h for h in hotspots if h.get("status") == status]
        if severity:
            hotspots = [h for h in hotspots if h.get("severity") == severity]
        
        # Limit results
        hotspots = hotspots[:limit]
        
        return hotspots
        
    except Exception as e:
        logger.error(f"Error getting hotspots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top")
async def get_top_hotspots(limit: int = Query(5, ge=1, le=20)) -> List[Dict[str, Any]]:
    """Get top hotspots by severity and percentage above baseline."""
    try:
        hotspots = await db_client.get_active_hotspots()
        
        # Sort by severity (critical first) and percent_above
        severity_order = {"critical": 3, "warn": 2, "info": 1}
        hotspots.sort(
            key=lambda h: (
                severity_order.get(h.get("severity", "info"), 0),
                h.get("percent_above", 0)
            ),
            reverse=True
        )
        
        return hotspots[:limit]
        
    except Exception as e:
        logger.error(f"Error getting top hotspots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scan")
async def trigger_hotspot_scan() -> Dict[str, Any]:
    """Manually trigger hotspot detection scan."""
    try:
        logger.info("Manual hotspot scan triggered")
        hotspots = await hotspot_engine.scan_for_hotspots()
        
        return {
            "status": "completed",
            "hotspots_found": len(hotspots),
            "hotspots": hotspots
        }
        
    except Exception as e:
        logger.error(f"Error triggering hotspot scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_hotspot_stats() -> Dict[str, Any]:
    """Get hotspot statistics."""
    try:
        hotspots = await db_client.get_active_hotspots()
        
        stats = {
            "total": len(hotspots),
            "by_severity": {
                "critical": len([h for h in hotspots if h.get("severity") == "critical"]),
                "warn": len([h for h in hotspots if h.get("severity") == "warn"]),
                "info": len([h for h in hotspots if h.get("severity") == "info"])
            },
            "by_entity_type": {
                "supplier": len([h for h in hotspots if h.get("entity_type") == "supplier"]),
                "route": len([h for h in hotspots if h.get("entity_type") == "route"])
            }
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting hotspot stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
