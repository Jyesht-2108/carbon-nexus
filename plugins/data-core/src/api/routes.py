from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import pandas as pd
import uuid
from datetime import datetime

from src.ingestion.schema_validator import SchemaValidator
from src.processing.normalizer import DataNormalizer
from src.processing.outlier_detector import OutlierDetector
from src.processing.gap_filler import gap_filler
from src.processing.quality_metrics import QualityMetrics
from src.db.supabase_client import supabase_client
from src.utils.logger import logger

router = APIRouter()


@router.post("/ingest/csv")
async def ingest_csv(file: UploadFile = File(...)):
    """
    Ingest CSV file
    Process: validate → normalize → detect outliers → fill gaps → store
    """
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        logger.info(f"Received CSV with {len(df)} rows")
        
        # Validate schema
        is_valid, errors = SchemaValidator.validate_dataframe(df)
        if not is_valid:
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        # Normalize data
        df = DataNormalizer.normalize_dataframe(df)
        
        # Detect outliers
        df = OutlierDetector.flag_outliers(df)
        
        # Fill gaps
        df = gap_filler.fill_gaps(df)
        
        # Store raw events
        for _, row in df.iterrows():
            # Convert row to dict and handle timestamps
            payload = row.to_dict()
            for key, value in payload.items():
                if pd.isna(value):
                    payload[key] = None
                elif isinstance(value, pd.Timestamp):
                    payload[key] = value.isoformat()
            
            raw_event = {
                "supplier_id": row.get("supplier_id"),
                "timestamp": row.get("timestamp").isoformat() if pd.notna(row.get("timestamp")) else None,
                "payload": payload,
                "data_source": "csv_upload",
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_client.insert_raw_event(raw_event)
        
        # Store normalized events
        for _, row in df.iterrows():
            normalized_event = {
                "event_type": row.get("event_type"),
                "supplier_id": row.get("supplier_id"),
                "distance_km": row.get("distance_km"),
                "load_kg": row.get("load_kg"),
                "vehicle_type": row.get("vehicle_type"),
                "fuel_type": row.get("fuel_type"),
                "speed": row.get("speed"),
                "timestamp": row.get("timestamp").isoformat() if pd.notna(row.get("timestamp")) else None,
                "is_outlier": bool(row.get("is_outlier", False)),
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_client.insert_normalized_event(normalized_event)
        
        # Calculate and store quality metrics
        metrics = QualityMetrics.calculate_metrics(df)
        supabase_client.insert_quality_metrics(metrics)
        
        return JSONResponse(content={
            "status": "ok",
            "rows": len(df),
            "outliers": int(df["is_outlier"].sum()),
            "quality_metrics": metrics
        })
    
    except Exception as e:
        logger.error(f"Error processing CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/event")
async def ingest_event(event: Dict[str, Any]):
    """
    Ingest single event
    """
    try:
        # Validate event
        is_valid, errors = SchemaValidator.validate_event(event)
        if not is_valid:
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        # Store raw event
        raw_event = {
            "supplier_id": event.get("supplier_id"),
            "timestamp": event.get("timestamp"),
            "payload": event,
            "data_source": "api",
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_client.insert_raw_event(raw_event)
        
        # Normalize
        normalized = DataNormalizer.normalize_event(event)
        
        # Store normalized event
        normalized_event = {
            "event_type": normalized.get("event_type"),
            "supplier_id": normalized.get("supplier_id"),
            "distance_km": normalized.get("distance_km"),
            "load_kg": normalized.get("load_kg"),
            "vehicle_type": normalized.get("vehicle_type"),
            "fuel_type": normalized.get("fuel_type"),
            "speed": normalized.get("speed"),
            "timestamp": normalized.get("timestamp"),
            "is_outlier": False,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_client.insert_normalized_event(normalized_event)
        
        return JSONResponse(content={"status": "stored"})
    
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/upload")
async def ingest_upload(file: UploadFile = File(...)):
    """
    Handle file upload with job tracking
    Supports CSV and XLSX
    """
    try:
        job_id = str(uuid.uuid4())
        
        # Create job record
        job = {
            "job_id": job_id,
            "status": "received",
            "filename": file.filename,
            "rows_total": None,
            "rows_processed": 0,
            "errors": [],
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_client.insert_ingest_job(job)
        
        # Read file based on extension
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(pd.io.common.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(pd.io.common.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Update job with total rows
        supabase_client.update_ingest_job(job_id, {
            "rows_total": len(df),
            "status": "parsing"
        })
        
        logger.info(f"Job {job_id}: Processing {len(df)} rows")
        
        # Validate
        supabase_client.update_ingest_job(job_id, {"status": "validating"})
        is_valid, errors = SchemaValidator.validate_dataframe(df)
        
        if not is_valid:
            supabase_client.update_ingest_job(job_id, {
                "status": "failed",
                "errors": errors
            })
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        # Normalize
        supabase_client.update_ingest_job(job_id, {"status": "normalizing"})
        df = DataNormalizer.normalize_dataframe(df)
        
        # Detect outliers
        df = OutlierDetector.flag_outliers(df)
        
        # Fill gaps
        df = gap_filler.fill_gaps(df)
        
        # Insert data
        supabase_client.update_ingest_job(job_id, {"status": "inserting"})
        
        for idx, row in df.iterrows():
            # Convert row to dict and handle timestamps
            payload = row.to_dict()
            for key, value in payload.items():
                if pd.isna(value):
                    payload[key] = None
                elif isinstance(value, pd.Timestamp):
                    payload[key] = value.isoformat()
            
            # Insert raw
            raw_event = {
                "supplier_id": row.get("supplier_id"),
                "timestamp": row.get("timestamp").isoformat() if pd.notna(row.get("timestamp")) else None,
                "payload": payload,
                "data_source": "file_upload",
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_client.insert_raw_event(raw_event)
            
            # Insert normalized
            normalized_event = {
                "event_type": row.get("event_type"),
                "supplier_id": row.get("supplier_id"),
                "distance_km": row.get("distance_km"),
                "load_kg": row.get("load_kg"),
                "vehicle_type": row.get("vehicle_type"),
                "fuel_type": row.get("fuel_type"),
                "speed": row.get("speed"),
                "timestamp": row.get("timestamp").isoformat() if pd.notna(row.get("timestamp")) else None,
                "is_outlier": bool(row.get("is_outlier", False)),
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_client.insert_normalized_event(normalized_event)
            
            # Update progress
            if (idx + 1) % 50 == 0:
                supabase_client.update_ingest_job(job_id, {"rows_processed": idx + 1})
        
        # Calculate quality metrics
        metrics = QualityMetrics.calculate_metrics(df)
        supabase_client.insert_quality_metrics(metrics)
        
        # Mark complete
        supabase_client.update_ingest_job(job_id, {
            "status": "complete",
            "rows_processed": len(df)
        })
        
        return JSONResponse(content={
            "jobId": job_id,
            "message": "Upload received and processed",
            "rows": len(df)
        })
    
    except Exception as e:
        logger.error(f"Error in upload: {e}")
        if 'job_id' in locals():
            supabase_client.update_ingest_job(job_id, {
                "status": "failed",
                "errors": [str(e)]
            })
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ingest/status/{job_id}")
async def get_job_status(job_id: str):
    """Get upload job status"""
    try:
        job = supabase_client.get_ingest_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return JSONResponse(content=job)
    
    except Exception as e:
        logger.error(f"Error fetching job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data-quality/{supplier_id}")
async def get_data_quality(supplier_id: str):
    """Get data quality metrics for a supplier"""
    try:
        # This would fetch from data_quality table
        # For now, return a placeholder
        return JSONResponse(content={
            "supplier_id": supplier_id,
            "completeness_pct": 85,
            "predicted_pct": 15,
            "anomalies_count": 3
        })
    
    except Exception as e:
        logger.error(f"Error fetching data quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "data-core"}
