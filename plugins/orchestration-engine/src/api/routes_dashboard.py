"""Dashboard API routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..db.supabase_client import db_client
from ..services.ml_client import ml_client
from ..utils.logger import logger

router = APIRouter(prefix="/emissions", tags=["dashboard"])


@router.get("/current")
async def get_current_emissions() -> Dict[str, Any]:
    """Get current emission pulse."""
    try:
        # Get recent events
        events = await db_client.get_recent_events(limit=10)
        
        if not events:
            return {
                "current_rate": 0,
                "trend": "stable",
                "last_updated": None
            }
        
        # Calculate current rate (simplified)
        total_co2 = sum(e.get("co2_kg", 0) for e in events)
        avg_co2 = total_co2 / len(events) if events else 0
        
        return {
            "current_rate": round(avg_co2, 2),
            "trend": "increasing",  # TODO: Calculate actual trend
            "last_updated": events[0].get("timestamp") if events else None,
            "event_count": len(events)
        }
        
    except Exception as e:
        logger.error(f"Error getting current emissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
async def get_forecast() -> Dict[str, Any]:
    """Get 7-day emission forecast."""
    try:
        # Get historical data
        events = await db_client.get_recent_events(limit=30)
        
        if not events:
            return {
                "forecast": [],
                "confidence_low": [],
                "confidence_high": []
            }
        
        # Extract daily totals (simplified)
        history = [e.get("co2_kg", 0) for e in events[:7]]
        
        # Get forecast from ML Engine
        forecast_data = await ml_client.forecast_7d(history)
        
        if not forecast_data:
            # Return dummy forecast if ML Engine unavailable
            return {
                "forecast": [100, 105, 110, 108, 112, 115, 118],
                "confidence_low": [90, 95, 100, 98, 102, 105, 108],
                "confidence_high": [110, 115, 120, 118, 122, 125, 128]
            }
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error getting forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_emissions_summary() -> Dict[str, Any]:
    """Get emissions summary statistics."""
    try:
        events = await db_client.get_recent_events(limit=100)
        hotspots = await db_client.get_active_hotspots()
        
        total_co2 = sum(e.get("co2_kg", 0) for e in events)
        avg_co2 = total_co2 / len(events) if events else 0
        
        return {
            "total_emissions": round(total_co2, 2),
            "average_emissions": round(avg_co2, 2),
            "event_count": len(events),
            "active_hotspots": len(hotspots),
            "critical_hotspots": len([h for h in hotspots if h.get("severity") == "critical"])
        }
        
    except Exception as e:
        logger.error(f"Error getting emissions summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
