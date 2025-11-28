"""What-if simulation API routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from ..services.ml_client import ml_client
from ..utils.logger import logger

router = APIRouter(prefix="/simulate", tags=["simulation"])


class SimulationRequest(BaseModel):
    """Request model for what-if simulation."""
    scenario_type: str  # "logistics", "factory", "warehouse", "delivery"
    baseline_features: Dict[str, Any]
    changes: Dict[str, Any]


@router.post("")
async def run_simulation(request: SimulationRequest) -> Dict[str, Any]:
    """Run what-if scenario simulation."""
    try:
        # Get baseline prediction
        baseline_co2 = await _get_prediction(request.scenario_type, request.baseline_features)
        
        if baseline_co2 is None:
            raise HTTPException(status_code=400, detail="Could not get baseline prediction")
        
        # Apply changes to features
        modified_features = {**request.baseline_features, **request.changes}
        
        # Get modified prediction
        modified_co2 = await _get_prediction(request.scenario_type, modified_features)
        
        if modified_co2 is None:
            raise HTTPException(status_code=400, detail="Could not get modified prediction")
        
        # Calculate delta
        delta = modified_co2 - baseline_co2
        percent_change = (delta / baseline_co2 * 100) if baseline_co2 > 0 else 0
        
        return {
            "baseline_co2": round(baseline_co2, 2),
            "modified_co2": round(modified_co2, 2),
            "delta": round(delta, 2),
            "percent_change": round(percent_change, 2),
            "scenario_type": request.scenario_type,
            "changes_applied": request.changes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def _get_prediction(scenario_type: str, features: Dict[str, Any]) -> float:
    """Get prediction based on scenario type."""
    if scenario_type == "logistics":
        return await ml_client.predict_logistics(features)
    elif scenario_type == "factory":
        return await ml_client.predict_factory(features)
    elif scenario_type == "warehouse":
        return await ml_client.predict_warehouse(features)
    elif scenario_type == "delivery":
        return await ml_client.predict_delivery(features)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario type: {scenario_type}")


@router.post("/batch")
async def run_batch_simulation(scenarios: list[SimulationRequest]) -> list[Dict[str, Any]]:
    """Run multiple what-if scenarios."""
    try:
        results = []
        
        for scenario in scenarios:
            try:
                result = await run_simulation(scenario)
                results.append(result)
            except Exception as e:
                logger.error(f"Error in batch simulation: {e}")
                results.append({
                    "error": str(e),
                    "scenario_type": scenario.scenario_type
                })
        
        return results
        
    except Exception as e:
        logger.error(f"Error running batch simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
