from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from loguru import logger

from ..ml.logistics_predictor import LogisticsPredictor
from ..ml.factory_predictor import FactoryPredictor
from ..ml.warehouse_predictor import WarehousePredictor
from ..ml.delivery_predictor import DeliveryPredictor
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

# Batch request models
class BatchLogisticsRequest(BaseModel):
    predictions: List[dict]

class BatchFactoryRequest(BaseModel):
    predictions: List[dict]

class BatchWarehouseRequest(BaseModel):
    predictions: List[dict]

class BatchDeliveryRequest(BaseModel):
    predictions: List[dict]

@router.post("/batch/logistics")
async def batch_predict_logistics(request: BatchLogisticsRequest):
    """Batch predict logistics CO2 emissions"""
    try:
        results = []
        for item in request.predictions:
            features = preprocess_logistics_input(item)
            result = logistics_predictor.predict(features)
            results.append({
                'input': item,
                'prediction': result
            })
        
        logger.info(f"Batch logistics prediction: {len(results)} items")
        return {'results': results, 'count': len(results)}
    
    except Exception as e:
        logger.error(f"Batch logistics prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/factory")
async def batch_predict_factory(request: BatchFactoryRequest):
    """Batch predict factory CO2 emissions"""
    try:
        results = []
        for item in request.predictions:
            features = preprocess_factory_input(item)
            result = factory_predictor.predict(features)
            results.append({
                'input': item,
                'prediction': result
            })
        
        logger.info(f"Batch factory prediction: {len(results)} items")
        return {'results': results, 'count': len(results)}
    
    except Exception as e:
        logger.error(f"Batch factory prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/warehouse")
async def batch_predict_warehouse(request: BatchWarehouseRequest):
    """Batch predict warehouse CO2 emissions"""
    try:
        results = []
        for item in request.predictions:
            features = preprocess_warehouse_input(item)
            result = warehouse_predictor.predict(features)
            results.append({
                'input': item,
                'prediction': result
            })
        
        logger.info(f"Batch warehouse prediction: {len(results)} items")
        return {'results': results, 'count': len(results)}
    
    except Exception as e:
        logger.error(f"Batch warehouse prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/delivery")
async def batch_predict_delivery(request: BatchDeliveryRequest):
    """Batch predict delivery CO2 emissions"""
    try:
        results = []
        for item in request.predictions:
            features = preprocess_delivery_input(item)
            result = delivery_predictor.predict(features)
            results.append({
                'input': item,
                'prediction': result
            })
        
        logger.info(f"Batch delivery prediction: {len(results)} items")
        return {'results': results, 'count': len(results)}
    
    except Exception as e:
        logger.error(f"Batch delivery prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
