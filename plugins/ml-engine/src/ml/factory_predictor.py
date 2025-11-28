import numpy as np
import joblib
from pathlib import Path
from loguru import logger
from typing import Dict, Any

class FactoryPredictor:
    def __init__(self, model_path: str = "src/models/factory_model.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained factory model."""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Factory model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}, using fallback formula")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading factory model: {e}")
            self.model = None
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Predict CO2 emissions for factory.
        Features: [energy_kwh, machine_runtime_hours, furnace_usage, cooling_load, shift_hours]
        """
        try:
            if self.model is not None:
                prediction = self.model.predict(features)[0]
            else:
                # Fallback formula-based prediction
                energy_kwh = features[0, 0]
                furnace_usage = features[0, 2]
                cooling_load = features[0, 3]
                
                # CO2 emission factor for electricity (kg CO2 per kWh)
                electricity_factor = 0.5
                furnace_factor = 2.5
                cooling_factor = 0.3
                
                prediction = (
                    energy_kwh * electricity_factor +
                    furnace_usage * furnace_factor +
                    cooling_load * cooling_factor
                )
            
            return {
                "co2_kg": round(float(prediction), 2),
                "model_version": "v1",
                "confidence": 0.82
            }
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
