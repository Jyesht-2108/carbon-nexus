# ML Engine - Quick Start Guide

Get the ML Engine running in 5 minutes!

## Prerequisites

- Python 3.11+ installed
- macOS: `brew install libomp` (for XGBoost)
- Ubuntu: `sudo apt-get install libgomp1`

## Setup (4 steps)

### 1. Create Virtual Environment
```bash
cd plugins/ml-engine
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Generate Data & Train Models
```bash
# Generate realistic training data (30 seconds)
python data/generate_realistic_data.py

# Train all models (2-3 minutes)
python train_models_advanced.py
```

Expected output:
- 5 datasets with 5,000 samples each
- 5 trained models with R² > 0.98

### 4. Start Service
```bash
python run.py
```

Service starts on: **http://localhost:8001**

## Quick Test

Open a new terminal:

```bash
# Activate environment
cd plugins/ml-engine
source venv/bin/activate

# Run tests
python test_api.py
```

## Example API Call

```bash
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 150,
    "load_kg": 500,
    "vehicle_type": "truck_diesel",
    "fuel_type": "diesel"
  }'
```

Response:
```json
{
  "co2_kg": 38.2,
  "model_version": "v1",
  "confidence": 0.85
}
```

## API Documentation

Visit: **http://localhost:8001/docs**

Interactive Swagger UI with all endpoints and examples.

## Docker Quick Start

```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f ml-engine

# Stop
docker-compose down
```

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/predict/logistics` | POST | Transport emissions |
| `/api/v1/predict/factory` | POST | Factory emissions |
| `/api/v1/predict/warehouse` | POST | Warehouse emissions |
| `/api/v1/predict/delivery` | POST | Delivery emissions |
| `/api/v1/forecast/7d` | POST | 7-day forecast |
| `/api/v1/batch/logistics` | POST | Batch predictions |

## Troubleshooting

### XGBoost Error (macOS)
```bash
brew install libomp
```

### Models Not Loading
```bash
# Retrain models
python train_models_advanced.py
```

### Port Already in Use
```bash
# Change port in run.py or use:
uvicorn src.app:app --host 0.0.0.0 --port 8002
```

## Next Steps

1. **Evaluate Models**: `python evaluate_models.py`
2. **Advanced Tests**: `python test_advanced_features.py`
3. **Read Full Docs**: See `README.md` and `DEPLOYMENT.md`
4. **Integration**: Check `IMPLEMENTATION_SUMMARY.md`

## Support

- API Docs: http://localhost:8001/docs
- Health Check: http://localhost:8001/api/v1/health
- Logs: Check `logs/` directory

## Quick Reference

### Vehicle Types
`ev`, `two_wheeler`, `van`, `mini_truck`, `truck_cng`, `truck_diesel`

### Fuel Types
`electric`, `cng`, `hybrid`, `petrol`, `diesel`

### Example Predictions

**Electric Vehicle (100km)**
```bash
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{"distance_km": 100, "load_kg": 500, "vehicle_type": "ev", "fuel_type": "electric"}'
```
→ ~1 kg CO2

**Diesel Truck (100km)**
```bash
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{"distance_km": 100, "load_kg": 500, "vehicle_type": "truck_diesel", "fuel_type": "diesel"}'
```
→ ~26 kg CO2

**Cold Storage Warehouse**
```bash
curl -X POST http://localhost:8001/api/v1/predict/warehouse \
  -H "Content-Type: application/json" \
  -d '{"temperature": -10, "energy_kwh": 1500, "refrigeration_load": 4.0, "inventory_volume": 800}'
```
→ ~700 kg CO2

That's it! You're ready to use the ML Engine. 🚀
