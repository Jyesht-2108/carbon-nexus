import numpy as np
import joblib
from pathlib import Path
from loguru import logger
from typing import Dict, Any

class WarehousePredictor:
    def __init__(self, model_path: str = "src/models/warehouse_model.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained warehouse model."""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Warehouse model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}, using fallback formula")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading warehouse model: {e}")
            self.model = None
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Predict CO2 emissions for warehouse.
        Features: [temperature, refrigeration_load, inventory_volume, energy_kwh]
        """
        try:
            if self.model is not None:
                prediction = self.model.predict(features)[0]
            else:
                # Fallback formula-based prediction
                temperature = features[0, 0]
                refrigeration_load = features[0, 1]
                inventory_volume = features[0, 2]
                energy_kwh = features[0, 3]
                
                # Base emission factors
                electricity_factor = 0.5
                refrigeration_factor = 1.2
                
                # Temperature adjustment (higher cooling needs for lower temps)
                temp_adjustment = max(0, (25 - temperature) / 25) * 0.3
                
                prediction = (
                    energy_kwh * electricity_factor +
                    refrigeration_load * refrigeration_factor +
                    inventory_volume * 0.01 +
                    energy_kwh * temp_adjustment
                )
            
            return {
                "co2_kg": round(float(prediction), 2),
                "model_version": "v1",
                "confidence": 0.80
            }
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
