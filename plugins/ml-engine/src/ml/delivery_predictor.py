import numpy as np
import joblib
from pathlib import Path
from loguru import logger
from typing import Dict, Any

class DeliveryPredictor:
    def __init__(self, model_path: str = "src/models/delivery_model.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained delivery model."""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Delivery model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}, using fallback formula")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading delivery model: {e}")
            self.model = None
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Predict CO2 emissions for last-mile delivery.
        Features: [route_length, traffic_score, vehicle_type, delivery_count]
        """
        try:
            if self.model is not None:
                prediction = self.model.predict(features)[0]
            else:
                # Fallback formula-based prediction
                route_length = features[0, 0]
                traffic_score = features[0, 1]
                vehicle_type = features[0, 2]
                delivery_count = features[0, 3]
                
                # Base emission factors (kg CO2 per km)
                base_factors = {
                    0: 0.05,  # two_wheeler
                    1: 0.12,  # mini_truck
                    2: 0.20,  # truck_diesel
                    3: 0.15,  # truck_cng
                    4: 0.02,  # ev
                    5: 0.10   # van
                }
                
                base_emission = base_factors.get(int(vehicle_type), 0.1)
                
                # Traffic increases emissions
                traffic_multiplier = 1 + (traffic_score / 10) * 0.3
                
                # More deliveries = more stops = more emissions
                delivery_factor = 1 + (delivery_count / 50) * 0.2
                
                prediction = route_length * base_emission * traffic_multiplier * delivery_factor
            
            return {
                "co2_kg": round(float(prediction), 2),
                "model_version": "v1",
                "confidence": 0.83
            }
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
