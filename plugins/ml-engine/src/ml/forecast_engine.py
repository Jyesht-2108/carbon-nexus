import numpy as np
import joblib
from pathlib import Path
from loguru import logger
from typing import Dict, Any, List

class ForecastEngine:
    def __init__(self, model_path: str = "src/models/forecast_model.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained forecast model."""
        try:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Forecast model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}, using fallback method")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading forecast model: {e}")
            self.model = None
    
    def forecast_7d(self, history: List[float]) -> Dict[str, Any]:
        """
        Generate 7-day forecast from historical data.
        
        Args:
            history: List of historical emission values (daily)
        
        Returns:
            Dictionary with forecast, confidence bands
        """
        try:
            history = np.array(history)
            
            if len(history) < 3:
                # Not enough data, use last value
                last_value = history[-1] if len(history) > 0 else 100
                forecast = [last_value] * 7
                std = last_value * 0.1
            else:
                # Use trained model statistics if available
                if self.model is not None and isinstance(self.model, dict):
                    # Statistical model with trend
                    mean = self.model.get('mean', np.mean(history[-30:]))
                    trend = self.model.get('trend', 0)
                    std = self.model.get('std', np.std(history[-30:]))
                else:
                    # Calculate from history
                    recent = history[-30:] if len(history) >= 30 else history
                    mean = np.mean(recent)
                    std = np.std(recent)
                    trend = (history[-1] - history[max(0, len(history)-30)]) / min(30, len(history))
                
                # Generate forecast with trend and seasonality
                last_value = history[-1]
                forecast = []
                
                for i in range(1, 8):
                    # Base prediction with trend
                    predicted = last_value + (trend * i)
                    
                    # Add weekly seasonality (if enough history)
                    if len(history) >= 14:
                        day_of_week = (len(history) + i) % 7
                        seasonal_pattern = history[-14:][day_of_week::7]
                        if len(seasonal_pattern) > 0:
                            seasonal_factor = np.mean(seasonal_pattern) / mean
                            predicted *= seasonal_factor
                    
                    # Add small random variation
                    variation = np.random.normal(0, std * 0.1)
                    forecast.append(predicted + variation)
            
            forecast = [float(f) for f in forecast]
            
            # Calculate confidence bands based on historical std
            if len(history) >= 7:
                std = np.std(history[-30:]) if len(history) >= 30 else np.std(history)
            else:
                std = np.mean(forecast) * 0.1
            
            confidence_low = [max(0, f - 1.96 * std) for f in forecast]
            confidence_high = [f + 1.96 * std for f in forecast]
            
            return {
                "forecast": [round(f, 2) for f in forecast],
                "confidence_low": [round(c, 2) for c in confidence_low],
                "confidence_high": [round(c, 2) for c in confidence_high],
                "model_version": "v1",
                "horizon_days": 7
            }
        
        except Exception as e:
            logger.error(f"Forecast error: {e}")
            raise
