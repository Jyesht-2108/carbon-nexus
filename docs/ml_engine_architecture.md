# ML Engine Plugin Architecture (ml-engine)

This document defines the full architecture for the **Carbon Nexus ML Engine Plugin**, designed for implementation in **Kiro / Cursor**. It contains structure, model list, inference endpoints, training workflow, data schema expectations, and integration contracts. The ML plugin is completely isolated and exposes only FastAPI endpoints.

The ML Engine is one of the core plugins owned by a single team member. It must be:
- Self-contained
- Docker-friendly
- Easy to deploy
- Easy for other backend plugins (orchestration-engine, data-core) to consume
- Stateless at inference time (models loaded into memory)

---
# 1. Goals of the ML Engine Plugin

The plugin must provide all **system-level ML intelligence**, including:

### 1. Emission Prediction Models
- Logistics CO₂ predictor
- Factory CO₂ predictor
- Warehouse CO₂ predictor
- Delivery (last-mile) CO₂ predictor

### 2. Emission Forecasting
- 7-day CO₂ forecast (time-series model)

### 3. Utility
- Feature importance (if model supports)
- Standard feature normalization
- Model versioning
- Batch prediction option (optional)

The plugin must be plug-and-play for any other service.

---
# 2. Technology Stack

| Component | Library |
|-----------|---------|
| Model Server | **FastAPI** |
| ML Algorithms | **XGBoost, LightGBM, Scikit-Learn, Statsmodels, PyTorch (optional)** |
| Time-Series | **Prophet (optional), LSTM (PyTorch), or ARIMA** |
| Data Processing | **Pandas, NumPy** |
| Serialization | **joblib** or **pickle** |
| Logging | **Loguru** |
| Testing | **pytest** |

---
# 3. Folder Structure

```
plugins/ml-engine/
  ├── src/
  │   ├── api/
  │   │   └── routes.py
  │   ├── models/
  │   │   ├── logistics_model.pkl
  │   │   ├── factory_model.pkl
  │   │   ├── warehouse_model.pkl
  │   │   ├── delivery_model.pkl
  │   │   └── forecast_model.pkl
  │   ├── ml/
  │   │   ├── logistics_predictor.py
  │   │   ├── factory_predictor.py
  │   │   ├── warehouse_predictor.py
  │   │   ├── delivery_predictor.py
  │   │   └── forecast_engine.py
  │   ├── utils/
  │   │   ├── preprocessing.py
  │   │   ├── postprocessing.py
  │   │   ├── feature_mapping.py
  │   ├── app.py
  ├── requirements.txt
  └── Dockerfile
```

---
# 4. Model List & Features

Below are the required ML models and the features each model expects.

## **4.1 Logistics CO₂ Emission Predictor (XGBoost Regression)**
Used for long-distance supply chain transport.

**Input Features:**
- distance_km
- load_kg
- vehicle_type (encoded)
- fuel_type (encoded)
- avg_speed
- stop_events

**Output:**
```json
{ "co2_kg": 12.45 }
```

---
## **4.2 Factory CO₂ Emission Predictor (Regression or LSTM)**
Predicts daily factory emissions.

**Input Features:**
- energy_kwh
- machine_runtime_hours
- furnace_usage
- cooling_load
- shift_hours

**Output:**
```json
{ "co2_kg": 482 }
```

---
## **4.3 Warehouse Emission Predictor (Regression)**
Simple regression-based model.

**Input Features:**
- refrigeration_load
- inventory_volume
- temperature
- energy_kwh

**Output:**
```json
{ "co2_kg": 92 }
```

---
## **4.4 Delivery (Last Mile) Emission Predictor**
Predicts delivery-level emissions.

**Input:**
- route_length
- traffic_score
- vehicle_type
- delivery_count

**Output:**
```json
{ "co2_kg": 1.3 }
```

---
## **4.5 7-Day Forecasting Model**
Supports:
- ARIMA
- Prophet
- LSTM

**Input:**
- past N daily emission values (time series)

**Output:**
```json
{
  "forecast": [120, 115, 118, 140, 150, 160, 155],
  "confidence_low": [...],
  "confidence_high": [...]
}
```

---
# 5. Inference API Specification

All inference endpoints follow **POST** JSON format.

This plugin will expose **FastAPI routes**:

## **5.1 Logistics Prediction**
`POST /predict/logistics`

```json
{
  "distance_km": 120,
  "load_kg": 450,
  "vehicle_type": "truck_diesel",
  "fuel_type": "diesel",
  "avg_speed": 50
}
```

Response:
```json
{ "co2_kg": 14.22 }
```

---
## **5.2 Factory Emission Prediction**
`POST /predict/factory`

```json
{
  "energy_kwh": 5200,
  "furnace_usage": 1.2,
  "cooling_load": 300,
  "shift_hours": 8
}
```

---
## **5.3 Warehouse Prediction**
`POST /predict/warehouse`

```json
{
  "temperature": 20,
  "refrigeration_load": 2.1,
  "inventory_volume": 450,
  "energy_kwh": 830
}
```

---
## **5.4 Delivery Prediction**
`POST /predict/delivery`

```json
{
  "route_length": 12,
  "traffic_score": 4,
  "vehicle_type": "two_wheeler",
  "delivery_count": 23
}
```

---
## **5.5 Forecast API**
`POST /forecast/7d`

```json
{
  "history": [120, 121, 118, 130, 150, 140]
}
```

---
# 6. Preprocessing Pipeline

### Steps:
1. Validate input schema
2. Encode categorical variables
3. Apply normalization/scaling (if used)
4. Handle missing values
5. Feature engineering (optional)

### Utilities Included
- `feature_mapping.py`
- `preprocessing.py`
- `postprocessing.py`

---
# 7. Model Loading & Versioning

Each model is stored as a `.pkl` or `.joblib` file.
At startup:

```python
logistics_model = load_model("models/logistics_model.pkl")
```

### Versioning strategy
```
models/
  v1/
  v2/
  latest -> v2
```

---
# 8. Logging & Monitoring

Use **Loguru** for structured logs.

Logged events:
- Inference request
- Inference latency
- Exceptions
- Model version that served the request

---
# 9. Testing

### Unit Tests
- Validate feature encoding
- Validate preprocessing edge cases
- Validate each model gives output in correct shape

### Integration Tests
- Test `/predict/*` endpoints
- Test forecast engine

---
# 10. Deliverables

### Minimum Deliverables
- All 4 emission models trained + saved
- Forecast model
- FastAPI app with all inference routes
- Basic preprocessing pipeline
- Dockerfile

### Optional (Stretch)
- Explainability endpoint (SHAP)
- Batch prediction endpoint

---
# 11. Summary

The ML Engine Plugin is a fully independent microservice providing CO₂ estimation and forecasting. It uses FastAPI for inference, clean preprocessing utilities, and structured model loading. Other backend plugins depend on this service for real-time prediction.

This architecture is optimized for **Kiro, Cursor, and fast development**.

---

When ready, say:
> "Generate folder skeleton for ml-engine" or
> "Create inference code for logistics model"

