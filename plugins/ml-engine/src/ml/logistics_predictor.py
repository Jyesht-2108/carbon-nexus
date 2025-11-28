import numpy as np
import joblib
from pathlib import Path
from loguru import logger
from typing import Dict, Any

class LogisticsPredictor:
    def __init__(self, model_path: str = "src/models/logistics_model.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained logistics model."""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Logistics model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}, using fallback formula")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading logistics model: {e}")
            self.model = None
    
    def predict(self, features: np.ndarray, explain: bool = False) -> Dict[str, Any]:
        """
        Predict CO2 emissions for logistics.
        Features: [distance_km, load_kg, vehicle_type, fuel_type, avg_speed, stop_events]
        """
        try:
            if self.model is not None:
                prediction = self.model.predict(features)[0]
                
                # Get feature importance if requested
                feature_importance = None
                if explain and hasattr(self.model, 'feature_importances_'):
                    feature_names = ['distance_km', 'load_kg', 'vehicle_type', 
                                   'fuel_type', 'avg_speed', 'stop_events']
                    importance_values = self.model.feature_importances_
                    feature_importance = {
                        name: round(float(imp), 4) 
                        for name, imp in zip(feature_names, importance_values)
                    }
            else:
                # Fallback formula-based prediction
                distance_km = features[0, 0]
                load_kg = features[0, 1]
                vehicle_type = features[0, 2]
                fuel_type = features[0, 3]
                
                # Base emission factors (kg CO2 per km)
                base_factors = {
                    0: 0.08,  # two_wheeler
                    1: 0.15,  # mini_truck
                    2: 0.25,  # truck_diesel
                    3: 0.18,  # truck_cng
                    4: 0.05,  # ev
                    5: 0.12   # van
                }
                
                base_emission = base_factors.get(int(vehicle_type), 0.2)
                load_factor = 1 + (load_kg / 1000) * 0.1
                prediction = distance_km * base_emission * load_factor
                feature_importance = None
            
            result = {
                "co2_kg": round(float(prediction), 2),
                "model_version": "v1",
                "confidence": 0.85
            }
            
            if feature_importance:
                result["feature_importance"] = feature_importance
            
            return result
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
