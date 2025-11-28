from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from loguru import logger

from ..ml.logistics_predictor import LogisticsPredictor
from ..ml.factory_predictor import FactoryPredictor
from ..ml.warehouse_predictor import WarehousePredictor
from ..ml.delivery_predictor import DeliveryPredictor
from ..ml.forecast_engine import ForecastEngine
from ..utils.preprocessing import (
    preprocess_logistics_input,
    preprocess_factory_input,
    preprocess_warehouse_input,
    preprocess_delivery_input
)

router = APIRouter()

# Initialize predictors
logistics_predictor = LogisticsPredictor()
factory_predictor = FactoryPredictor()
warehouse_predictor = WarehousePredictor()
delivery_predictor = DeliveryPredictor()
forecast_engine = ForecastEngine()

# Request models
class LogisticsRequest(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance in kilometers")
    load_kg: float = Field(..., ge=0, description="Load weight in kilograms")
    vehicle_type: str = Field(..., description="Vehicle type")
    fuel_type: str = Field(..., description="Fuel type")
    avg_speed: Optional[float] = Field(50, description="Average speed in km/h")
    stop_events: Optional[int] = Field(0, description="Number of stops")

class FactoryRequest(BaseModel):
    energy_kwh: float = Field(..., gt=0, description="Energy consumption in kWh")
    shift_hours: float = Field(..., gt=0, description="Shift duration in hours")
    machine_runtime_hours: Optional[float] = Field(8, description="Machine runtime")
    furnace_usage: Optional[float] = Field(0, description="Furnace usage")
    cooling_load: Optional[float] = Field(0, description="Cooling load")

class WarehouseRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    energy_kwh: float = Field(..., gt=0, description="Energy consumption in kWh")
    refrigeration_load: Optional[float] = Field(0, description="Refrigeration load")
    inventory_volume: Optional[float] = Field(0, description="Inventory volume")

class DeliveryRequest(BaseModel):
    route_length: float = Field(..., gt=0, description="Route length in km")
    vehicle_type: str = Field(..., description="Vehicle type")
    traffic_score: Optional[int] = Field(3, ge=1, le=10, description="Traffic score 1-10")
    delivery_count: Optional[int] = Field(1, description="Number of deliveries")

class ForecastRequest(BaseModel):
    history: List[float] = Field(..., min_items=1, description="Historical emission values")

# Response models
class PredictionResponse(BaseModel):
    co2_kg: float
    model_version: str
    confidence: float

class ForecastResponse(BaseModel):
    forecast: List[float]
    confidence_low: List[float]
    confidence_high: List[float]
    model_version: str
    horizon_days: int

# Endpoints
@router.post("/predict/logistics", response_model=PredictionResponse)
async def predict_logistics(request: LogisticsRequest):
    """Predict CO2 emissions for logistics/transport."""
    try:
        features = preprocess_logistics_input(request.dict())
        result = logistics_predictor.predict(features)
        logger.info(f"Logistics prediction: {result['co2_kg']} kg CO2")
        return result
    except Exception as e:
        logger.error(f"Logistics prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/factory", response_model=PredictionResponse)
async def predict_factory(request: FactoryRequest):
    """Predict CO2 emissions for factory operations."""
    try:
        features = preprocess_factory_input(request.dict())
        result = factory_predictor.predict(features)
        logger.info(f"Factory prediction: {result['co2_kg']} kg CO2")
        return result
    except Exception as e:
        logger.error(f"Factory prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/warehouse", response_model=PredictionResponse)
async def predict_warehouse(request: WarehouseRequest):
    """Predict CO2 emissions for warehouse operations."""
    try:
        features = preprocess_warehouse_input(request.dict())
        result = warehouse_predictor.predict(features)
        logger.info(f"Warehouse prediction: {result['co2_kg']} kg CO2")
        return result
    except Exception as e:
        logger.error(f"Warehouse prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/delivery", response_model=PredictionResponse)
async def predict_delivery(request: DeliveryRequest):
    """Predict CO2 emissions for last-mile delivery."""
    try:
        features = preprocess_delivery_input(request.dict())
        result = delivery_predictor.predict(features)
        logger.info(f"Delivery prediction: {result['co2_kg']} kg CO2")
        return result
    except Exception as e:
        logger.error(f"Delivery prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast/7d", response_model=ForecastResponse)
async def forecast_7d(request: ForecastRequest):
    """Generate 7-day CO2 emission forecast."""
    try:
        result = forecast_engine.forecast_7d(request.history)
        logger.info(f"7-day forecast generated: {result['forecast']}")
        return result
    except Exception as e:
        logger.error(f"Forecast failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ml-engine",
        "models_loaded": {
            "logistics": logistics_predictor.model is not None,
            "factory": factory_predictor.model is not None,
            "warehouse": warehouse_predictor.model is not None,
            "delivery": delivery_predictor.model is not None,
            "forecast": forecast_engine.model is not None
        }
    }
