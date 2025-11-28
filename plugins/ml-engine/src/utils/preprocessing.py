import pandas as pd
import numpy as np
from typing import Dict, Any
from loguru import logger

# Vehicle type encoding
VEHICLE_TYPE_ENCODING = {
    "two_wheeler": 0,
    "mini_truck": 1,
    "truck_diesel": 2,
    "truck_cng": 3,
    "ev": 4,
    "van": 5
}

# Fuel type encoding
FUEL_TYPE_ENCODING = {
    "diesel": 0,
    "petrol": 1,
    "cng": 2,
    "electric": 3,
    "hybrid": 4
}

def encode_categorical(value: str, encoding_map: Dict[str, int], default: int = 0) -> int:
    """Encode categorical variable to numeric."""
    return encoding_map.get(value.lower(), default)

def validate_and_fill_missing(data: Dict[str, Any], required_fields: list, defaults: Dict[str, Any]) -> Dict[str, Any]:
    """Validate input and fill missing values with defaults."""
    processed = data.copy()
    
    for field in required_fields:
        if field not in processed or processed[field] is None:
            if field in defaults:
                processed[field] = defaults[field]
                logger.warning(f"Missing field '{field}', using default: {defaults[field]}")
            else:
                raise ValueError(f"Required field '{field}' is missing and no default provided")
    
    return processed

def preprocess_logistics_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess logistics prediction input."""
    defaults = {
        "avg_speed": 50,
        "stop_events": 0
    }
    
    required = ["distance_km", "load_kg", "vehicle_type", "fuel_type"]
    processed = validate_and_fill_missing(data, required, defaults)
    
    # Encode categorical variables
    vehicle_encoded = encode_categorical(processed["vehicle_type"], VEHICLE_TYPE_ENCODING)
    fuel_encoded = encode_categorical(processed["fuel_type"], FUEL_TYPE_ENCODING)
    
    # Create feature array
    features = np.array([
        processed["distance_km"],
        processed["load_kg"],
        vehicle_encoded,
        fuel_encoded,
        processed.get("avg_speed", 50),
        processed.get("stop_events", 0)
    ]).reshape(1, -1)
    
    return features

def preprocess_factory_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess factory prediction input."""
    defaults = {
        "machine_runtime_hours": 8,
        "furnace_usage": 0,
        "cooling_load": 0
    }
    
    required = ["energy_kwh", "shift_hours"]
    processed = validate_and_fill_missing(data, required, defaults)
    
    features = np.array([
        processed["energy_kwh"],
        processed.get("machine_runtime_hours", 8),
        processed.get("furnace_usage", 0),
        processed.get("cooling_load", 0),
        processed["shift_hours"]
    ]).reshape(1, -1)
    
    return features

def preprocess_warehouse_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess warehouse prediction input."""
    defaults = {
        "refrigeration_load": 0,
        "inventory_volume": 0
    }
    
    required = ["temperature", "energy_kwh"]
    processed = validate_and_fill_missing(data, required, defaults)
    
    features = np.array([
        processed["temperature"],
        processed.get("refrigeration_load", 0),
        processed.get("inventory_volume", 0),
        processed["energy_kwh"]
    ]).reshape(1, -1)
    
    return features

def preprocess_delivery_input(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess delivery prediction input."""
    defaults = {
        "traffic_score": 3,
        "delivery_count": 1
    }
    
    required = ["route_length", "vehicle_type"]
    processed = validate_and_fill_missing(data, required, defaults)
    
    vehicle_encoded = encode_categorical(processed["vehicle_type"], VEHICLE_TYPE_ENCODING)
    
    features = np.array([
        processed["route_length"],
        processed.get("traffic_score", 3),
        vehicle_encoded,
        processed.get("delivery_count", 1)
    ]).reshape(1, -1)
    
    return features
