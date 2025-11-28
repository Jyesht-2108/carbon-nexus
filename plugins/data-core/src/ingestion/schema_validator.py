from typing import Dict, List, Any, Tuple
import pandas as pd
from datetime import datetime
from src.utils.constants import REQUIRED_COLUMNS, OPTIONAL_COLUMNS
from src.utils.logger import logger


class SchemaValidator:
    """Validates incoming data against expected schema"""
    
    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validate DataFrame schema
        Returns: (is_valid, list_of_errors)
        """
        errors = []
        
        # Check for required columns
        missing_required = set(REQUIRED_COLUMNS) - set(df.columns)
        if missing_required:
            errors.append(f"Missing required columns: {', '.join(missing_required)}")
        
        # Check if DataFrame is empty
        if df.empty:
            errors.append("DataFrame is empty")
        
        # Validate timestamp format
        if "timestamp" in df.columns:
            try:
                pd.to_datetime(df["timestamp"])
            except Exception as e:
                errors.append(f"Invalid timestamp format: {str(e)}")
        
        is_valid = len(errors) == 0
        
        if is_valid:
            logger.info(f"Schema validation passed for {len(df)} rows")
        else:
            logger.warning(f"Schema validation failed: {errors}")
        
        return is_valid, errors
    
    @staticmethod
    def validate_event(event: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate single event object
        Returns: (is_valid, list_of_errors)
        """
        errors = []
        
        # Check required fields
        for field in REQUIRED_COLUMNS:
            if field not in event:
                errors.append(f"Missing required field: {field}")
        
        # Validate timestamp
        if "timestamp" in event:
            try:
                datetime.fromisoformat(str(event["timestamp"]).replace("Z", "+00:00"))
            except Exception as e:
                errors.append(f"Invalid timestamp: {str(e)}")
        
        # Validate numeric fields
        numeric_fields = ["distance_km", "load_kg", "energy_kwh", "speed"]
        for field in numeric_fields:
            if field in event and event[field] is not None:
                try:
                    float(event[field])
                except (ValueError, TypeError):
                    errors.append(f"Invalid numeric value for {field}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    @staticmethod
    def detect_column_mapping(df: pd.DataFrame) -> Dict[str, str]:
        """
        Auto-detect column mappings using fuzzy matching
        Returns: dict mapping detected_column -> standard_column
        """
        mapping = {}
        
        # Simple fuzzy matching rules
        fuzzy_rules = {
            "timestamp": ["time", "date", "datetime", "created_at"],
            "supplier_id": ["supplier", "vendor_id", "vendor"],
            "distance_km": ["distance", "dist", "km"],
            "load_kg": ["load", "weight", "cargo"],
            "vehicle_type": ["vehicle", "transport_type"],
            "fuel_type": ["fuel"],
            "energy_kwh": ["energy", "power"],
        }
        
        df_columns_lower = {col.lower(): col for col in df.columns}
        
        for standard_col, alternatives in fuzzy_rules.items():
            for alt in alternatives:
                if alt in df_columns_lower:
                    mapping[df_columns_lower[alt]] = standard_col
                    break
        
        if mapping:
            logger.info(f"Auto-detected column mappings: {mapping}")
        
        return mapping
