# ML Engine Plugin

Advanced CO2 emission prediction and forecasting service for Carbon Nexus using real emission factors from EPA, DEFRA, and IPCC.

## Features

✅ **4 Trained ML Models** (XGBoost & LightGBM)
- Logistics/Transport emissions (R² = 0.993)
- Factory emissions (R² = 0.992)
- Warehouse emissions (R² = 0.994)
- Last-mile delivery emissions (R² = 0.983)

✅ **Time-Series Forecasting** (7-day predictions with confidence intervals)

✅ **Batch Predictions** (Process multiple predictions in one request)

✅ **Real Emission Factors** (Based on EPA, DEFRA, IPCC standards)

✅ **Feature Importance** (Understand what drives emissions)

## Quick Start

### 1. Setup Environment
```bash
cd plugins/ml-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Generate Training Data
```bash
python data/generate_realistic_data.py
```

### 3. Train Models
```bash
python train_models_advanced.py
```

### 4. Start Service
```bash
python run.py
```

Service runs on: `http://localhost:8001`

## API Endpoints

### Single Predictions

**Logistics** - `POST /api/v1/predict/logistics`
```json
{
  "distance_km": 120,
  "load_kg": 450,
  "vehicle_type": "truck_diesel",
  "fuel_type": "diesel",
  "avg_speed": 50
}
```

**Factory** - `POST /api/v1/predict/factory`
```json
{
  "energy_kwh": 5200,
  "shift_hours": 8,
  "furnace_usage": 1.2,
  "cooling_load": 300
}
```

**Warehouse** - `POST /api/v1/predict/warehouse`
```json
{
  "temperature": 20,
  "energy_kwh": 830,
  "refrigeration_load": 2.1,
  "inventory_volume": 450
}
```

**Delivery** - `POST /api/v1/predict/delivery`
```json
{
  "route_length": 12,
  "vehicle_type": "two_wheeler",
  "traffic_score": 4,
  "delivery_count": 23
}
```

**Forecast** - `POST /api/v1/forecast/7d`
```json
{
  "history": [120, 121, 118, 130, 150, 140]
}
```

### Batch Predictions

**Batch Logistics** - `POST /api/v1/batch/logistics`
```json
{
  "predictions": [
    {"distance_km": 100, "load_kg": 400, "vehicle_type": "truck_diesel", "fuel_type": "diesel"},
    {"distance_km": 50, "load_kg": 200, "vehicle_type": "ev", "fuel_type": "electric"}
  ]
}
```

Similar endpoints available for: `/batch/factory`, `/batch/warehouse`, `/batch/delivery`

## Testing

```bash
# Basic API tests
python test_api.py

# Advanced feature tests
python test_advanced_features.py

# Model evaluation
python evaluate_models.py
```

## Model Performance

| Model | R² Score | RMSE | MAE | MAPE |
|-------|----------|------|-----|------|
| Logistics | 0.9930 | 1.14 kg | 0.61 kg | 8.99% |
| Factory | 0.9921 | 260.18 kg | 167.39 kg | 4.09% |
| Warehouse | 0.9941 | 13.70 kg | 9.43 kg | 3.81% |
| Delivery | 0.9831 | 0.45 kg | 0.30 kg | 4.66% |

## Vehicle Types & Emission Factors

| Vehicle | Base Factor (kg CO2/km) | Use Case |
|---------|------------------------|----------|
| `ev` | 0.053 | Electric vehicles (cleanest) |
| `two_wheeler` | 0.084 | Motorcycles, scooters |
| `van` | 0.143 | Delivery vans |
| `mini_truck` | 0.171 | Light commercial |
| `truck_cng` | 0.198 | CNG trucks |
| `truck_diesel` | 0.267 | Heavy diesel trucks |

## Fuel Types
- `electric` - Electric (cleanest)
- `cng` - Compressed Natural Gas
- `hybrid` - Hybrid vehicles
- `petrol` - Gasoline
- `diesel` - Diesel fuel

## Docker Deployment

```bash
# Build
docker build -t ml-engine .

# Run
docker run -p 8001:8001 ml-engine

# Or use docker-compose
docker-compose up -d
```

## API Documentation

Interactive docs available at:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Integration Example

```python
import requests

# Single prediction
response = requests.post(
    "http://localhost:8001/api/v1/predict/logistics",
    json={
        "distance_km": 150,
        "load_kg": 500,
        "vehicle_type": "truck_diesel",
        "fuel_type": "diesel"
    }
)
print(f"CO2: {response.json()['co2_kg']} kg")

# Batch prediction
response = requests.post(
    "http://localhost:8001/api/v1/batch/logistics",
    json={
        "predictions": [
            {"distance_km": 100, "load_kg": 400, "vehicle_type": "ev", "fuel_type": "electric"},
            {"distance_km": 200, "load_kg": 800, "vehicle_type": "truck_diesel", "fuel_type": "diesel"}
        ]
    }
)
print(f"Processed {response.json()['count']} predictions")
```

## Data Sources

Training data based on real emission factors from:
- **EPA** (Environmental Protection Agency)
- **UK DEFRA** (Department for Environment, Food & Rural Affairs)
- **IPCC** (Intergovernmental Panel on Climate Change)

## Project Structure

```
plugins/ml-engine/
├── data/                          # Training datasets
│   ├── generate_realistic_data.py # Data generation script
│   └── *.csv                      # Generated datasets
├── src/
│   ├── api/                       # API routes
│   ├── ml/                        # ML predictors
│   ├── models/                    # Trained models (.pkl)
│   └── utils/                     # Preprocessing utilities
├── train_models_advanced.py       # Training script
├── evaluate_models.py             # Model evaluation
├── test_advanced_features.py      # Feature tests
└── run.py                         # Start service
```
