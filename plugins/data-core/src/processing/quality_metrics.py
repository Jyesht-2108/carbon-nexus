import pandas as pd
from typing import Dict, Any
from datetime import datetime
from src.utils.logger import logger


class QualityMetrics:
    """Calculate data quality metrics"""
    
    @staticmethod
    def calculate_metrics(df: pd.DataFrame, supplier_id: str = None) -> Dict[str, Any]:
        """
        Calculate data quality metrics for a DataFrame
        Returns metrics dict suitable for insertion into data_quality table
        """
        total_rows = len(df)
        
        if total_rows == 0:
            return {
                "supplier_id": supplier_id,
                "window_start": datetime.utcnow().isoformat(),
                "completeness_pct": 0,
                "predicted_pct": 0,
                "anomalies_count": 0
            }
        
        # Count filled/predicted values
        filled_columns = [col for col in df.columns if col.endswith("_filled")]
        predicted_count = 0
        
        for col in filled_columns:
            predicted_count += df[col].sum()
        
        # Calculate percentages
        real_pct = ((total_rows - predicted_count) / total_rows) * 100 if total_rows > 0 else 0
        predicted_pct = (predicted_count / total_rows) * 100 if total_rows > 0 else 0
        
        # Count anomalies/outliers
        anomalies_count = df["is_outlier"].sum() if "is_outlier" in df.columns else 0
        
        # Calculate completeness (non-null values)
        completeness_scores = []
        important_fields = ["distance_km", "load_kg", "vehicle_type", "fuel_type"]
        
        for field in important_fields:
            if field in df.columns:
                non_null_pct = (df[field].notna().sum() / total_rows) * 100
                completeness_scores.append(non_null_pct)
        
        avg_completeness = sum(completeness_scores) / len(completeness_scores) if completeness_scores else 0
        
        metrics = {
            "supplier_id": supplier_id,
            "window_start": datetime.utcnow().isoformat(),
            "completeness_pct": round(avg_completeness, 2),
            "predicted_pct": round(predicted_pct, 2),
            "anomalies_count": int(anomalies_count),
            "total_rows": total_rows
        }
        
        logger.info(f"Quality metrics: {metrics}")
        return metrics
    
    @staticmethod
    def calculate_field_completeness(df: pd.DataFrame) -> Dict[str, float]:
        """Calculate completeness percentage for each field"""
        completeness = {}
        
        for col in df.columns:
            if col.endswith("_filled") or col.endswith("_confidence"):
                continue
            
            non_null_count = df[col].notna().sum()
            total_count = len(df)
            completeness[col] = (non_null_count / total_count * 100) if total_count > 0 else 0
        
        return completeness
