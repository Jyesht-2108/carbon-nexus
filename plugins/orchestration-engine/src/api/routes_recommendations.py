"""Recommendation API routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..db.supabase_client import db_client
from ..services.rag_client import rag_client
from ..utils.logger import logger

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class ApproveRecommendationRequest(BaseModel):
    """Request model for approving recommendation."""
    notes: Optional[str] = None


@router.get("")
async def get_recommendations(
    status: Optional[str] = Query(None, description="Filter by status")
) -> List[Dict[str, Any]]:
    """Get recommendations with optional status filter."""
    try:
        recommendations = await db_client.get_recommendations(status=status)
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending")
async def get_pending_recommendations() -> List[Dict[str, Any]]:
    """Get pending recommendations."""
    try:
        recommendations = await db_client.get_recommendations(status="pending")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting pending recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rec_id}/approve")
async def approve_recommendation(
    rec_id: int,
    request: ApproveRecommendationRequest
) -> Dict[str, Any]:
    """Approve a recommendation."""
    try:
        success = await db_client.update_recommendation_status(rec_id, "approved")
        
        if not success:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        # Log audit trail
        await db_client.insert_audit_log({
            "action": "approve_recommendation",
            "entity_type": "recommendation",
            "entity_id": rec_id,
            "notes": request.notes,
            "timestamp": None  # Will use DB default
        })
        
        logger.info(f"Recommendation {rec_id} approved")
        
        return {
            "status": "approved",
            "recommendation_id": rec_id,
            "message": "Recommendation approved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rec_id}/reject")
async def reject_recommendation(
    rec_id: int,
    request: ApproveRecommendationRequest
) -> Dict[str, Any]:
    """Reject a recommendation."""
    try:
        success = await db_client.update_recommendation_status(rec_id, "rejected")
        
        if not success:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        # Log audit trail
        await db_client.insert_audit_log({
            "action": "reject_recommendation",
            "entity_type": "recommendation",
            "entity_id": rec_id,
            "notes": request.notes,
            "timestamp": None
        })
        
        logger.info(f"Recommendation {rec_id} rejected")
        
        return {
            "status": "rejected",
            "recommendation_id": rec_id,
            "message": "Recommendation rejected"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_recommendation_stats() -> Dict[str, Any]:
    """Get recommendation statistics."""
    try:
        recommendations = await db_client.get_recommendations()
        
        stats = {
            "total": len(recommendations),
            "by_status": {
                "pending": len([r for r in recommendations if r.get("status") == "pending"]),
                "approved": len([r for r in recommendations if r.get("status") == "approved"]),
                "rejected": len([r for r in recommendations if r.get("status") == "rejected"]),
                "implemented": len([r for r in recommendations if r.get("status") == "implemented"])
            },
            "total_co2_reduction": sum(r.get("co2_reduction", 0) for r in recommendations if r.get("status") in ["approved", "implemented"])
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting recommendation stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
