import pandas as pd
from typing import Dict, Any
from src.utils.constants import VEHICLE_TYPE_MAPPING, FUEL_TYPE_MAPPING
from src.utils.logger import logger


class DataNormalizer:
    """Normalizes raw data into consistent format"""
    
    @staticmethod
    def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """Normalize entire DataFrame"""
        df = df.copy()
        
        # Normalize vehicle types
        if "vehicle_type" in df.columns:
            df["vehicle_type"] = df["vehicle_type"].apply(
                DataNormalizer._normalize_vehicle_type
            )
        
        # Normalize fuel types
        if "fuel_type" in df.columns:
            df["fuel_type"] = df["fuel_type"].apply(
                DataNormalizer._normalize_fuel_type
            )
        
        # Ensure numeric fields are proper types
        numeric_fields = ["distance_km", "load_kg", "energy_kwh", "speed", "temperature"]
        for field in numeric_fields:
            if field in df.columns:
                df[field] = pd.to_numeric(df[field], errors="coerce")
        
        # Normalize timestamp
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        
        # Fill NaN with None for JSON serialization
        df = df.where(pd.notnull(df), None)
        
        logger.info(f"Normalized {len(df)} rows")
        return df
    
    @staticmethod
    def normalize_event(event: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize single event"""
        normalized = event.copy()
        
        # Normalize vehicle type
        if "vehicle_type" in normalized and normalized["vehicle_type"]:
            normalized["vehicle_type"] = DataNormalizer._normalize_vehicle_type(
                normalized["vehicle_type"]
            )
        
        # Normalize fuel type
        if "fuel_type" in normalized and normalized["fuel_type"]:
            normalized["fuel_type"] = DataNormalizer._normalize_fuel_type(
                normalized["fuel_type"]
            )
        
        # Ensure numeric fields
        numeric_fields = ["distance_km", "load_kg", "energy_kwh", "speed", "temperature"]
        for field in numeric_fields:
            if field in normalized and normalized[field] is not None:
                try:
                    normalized[field] = float(normalized[field])
                except (ValueError, TypeError):
                    normalized[field] = None
        
        return normalized
    
    @staticmethod
    def _normalize_vehicle_type(vehicle_type: Any) -> str:
        """Normalize vehicle type to standard format"""
        if pd.isna(vehicle_type) or vehicle_type is None:
            return None
        
        vehicle_str = str(vehicle_type).lower().strip()
        return VEHICLE_TYPE_MAPPING.get(vehicle_str, vehicle_str)
    
    @staticmethod
    def _normalize_fuel_type(fuel_type: Any) -> str:
        """Normalize fuel type to standard format"""
        if pd.isna(fuel_type) or fuel_type is None:
            return None
        
        fuel_str = str(fuel_type).lower().strip()
        return FUEL_TYPE_MAPPING.get(fuel_str, fuel_str)
