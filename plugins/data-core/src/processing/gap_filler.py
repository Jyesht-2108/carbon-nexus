import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from sklearn.linear_model import LinearRegression
from src.utils.constants import GAP_FILLABLE_FIELDS
from src.utils.config import settings
from src.utils.logger import logger
import pickle
import os


class GapFiller:
    """Fills missing values using ML-based regression"""
    
    def __init__(self):
        self.models = {}
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained gap filling models"""
        model_path = "models/gap_filler_model.pkl"
        
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    self.models = pickle.load(f)
                logger.info("Loaded gap filling models")
            except Exception as e:
                logger.warning(f"Could not load gap filling models: {e}")
                self._initialize_default_models()
        else:
            logger.info("No pre-trained models found, using default models")
            self._initialize_default_models()
    
    def _initialize_default_models(self):
        """Initialize simple default models"""
        for field in GAP_FILLABLE_FIELDS:
            self.models[field] = LinearRegression()
    
    def fill_gaps(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fill missing values in DataFrame
        Adds columns: {field}_filled, {field}_confidence
        """
        df = df.copy()
        
        for field in GAP_FILLABLE_FIELDS:
            if field not in df.columns:
                continue
            
            missing_mask = df[field].isna()
            missing_count = missing_mask.sum()
            
            if missing_count == 0:
                continue
            
            logger.info(f"Filling {missing_count} missing values for {field}")
            
            # Use median-based filling as fallback
            filled_values, confidences = self._fill_with_median(df, field, missing_mask)
            
            # Mark filled values
            df[f"{field}_filled"] = False
            df.loc[missing_mask, f"{field}_filled"] = True
            df.loc[missing_mask, field] = filled_values
            df[f"{field}_confidence"] = 1.0
            df.loc[missing_mask, f"{field}_confidence"] = confidences
        
        return df
    
    def _fill_with_median(self, df: pd.DataFrame, field: str, missing_mask: pd.Series) -> tuple:
        """Fill missing values with median (simple fallback)"""
        median_value = df[field].median()
        
        if pd.isna(median_value):
            median_value = 0.0
        
        filled_values = [median_value] * missing_mask.sum()
        confidences = [0.6] * missing_mask.sum()  # Medium confidence for median
        
        return filled_values, confidences
    
    def _fill_with_regression(self, df: pd.DataFrame, field: str, missing_mask: pd.Series) -> tuple:
        """Fill missing values using regression (advanced)"""
        # This is a placeholder for more sophisticated regression-based filling
        # Would use features like supplier_id, event_type, etc. to predict
        
        # For now, fall back to median
        return self._fill_with_median(df, field, missing_mask)
    
    def fill_single_value(self, field: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fill a single missing value
        Returns: {value, confidence, method}
        """
        if field not in GAP_FILLABLE_FIELDS:
            return {"value": None, "confidence": 0.0, "method": "none"}
        
        # Simple median-based filling for single values
        # In production, this would use historical data from the same supplier
        default_values = {
            "distance_km": 50.0,
            "energy_kwh": 100.0,
            "load_kg": 500.0,
            "speed": 40.0
        }
        
        return {
            "value": default_values.get(field, 0.0),
            "confidence": 0.5,
            "method": "default"
        }


# Singleton instance
gap_filler = GapFiller()
