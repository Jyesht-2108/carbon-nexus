# Integration Test Guide

## Overview

The `integration_test.sh` script verifies that all 5 Carbon Nexus services are properly integrated and communicating with each other.

## What It Tests

### 1. Service Health Checks ✅
- ML Engine health endpoint
- Data Core health endpoint
- Orchestration Engine health endpoint
- RAG Chatbot health endpoint
- Frontend UI availability

### 2. ML Prediction Pipeline 🤖
- Logistics emission predictions
- Factory emission predictions
- Response format validation

### 3. Data Ingestion Pipeline 📊
- Event ingestion to Data Core
- Data normalization
- Event processing

### 4. Orchestration Pipeline 🔥
- Hotspot retrieval
- Alert retrieval
- Recommendation retrieval
- Hotspot scan triggering

### 5. RAG Recommendation Pipeline 💡
- Recommendation generation
- AI-powered suggestions
- Response validation

### 6. WebSocket Connectivity 🔌
- WebSocket endpoint availability
- Real-time feed connections

### 7. Service Integration 📈
- Orchestration → ML Engine communication
- Orchestration → Data Core communication
- Service-to-service connectivity

## Prerequisites

### Required
- All 5 services running (via Docker Compose or manually)
- `curl` installed (usually pre-installed on macOS/Linux)

### Optional
- `websocat` or `wscat` for WebSocket testing
  ```bash
  npm install -g wscat
  # or
  brew install websocat
  ```

## Usage

### Quick Start

```bash
# Make script executable (first time only)
chmod +x integration_test.sh

# Run the tests
./integration_test.sh
```

### With Docker Compose

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
sleep 60

# Run integration tests
./integration_test.sh
```

### Manual Service Start

```bash
# Terminal 1: ML Engine
cd plugins/ml-engine && python -m src.main

# Terminal 2: Data Core
cd plugins/data-core && python -m src.main

# Terminal 3: Orchestration Engine
cd plugins/orchestration-engine && python -m src.main

# Terminal 4: RAG Chatbot
cd rag_chatbot_plugin && npm start

# Terminal 5: Frontend UI
cd frontend-ui && npm run dev

# Terminal 6: Run tests
./integration_test.sh
```

## Expected Output

### Success

```
==========================================
🧪 Carbon Nexus Integration Test Suite
==========================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Test 1: Service Health Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing ML Engine health...
✅ PASS - ML Engine Health Check

Testing Data Core health...
✅ PASS - Data Core Health Check

Testing Orchestration Engine health...
✅ PASS - Orchestration Engine Health Check

Testing RAG Chatbot health...
✅ PASS - RAG Chatbot Health Check

Testing Frontend UI...
✅ PASS - Frontend UI Health Check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Test 2: ML Prediction Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing ML Engine logistics prediction...
✅ PASS - ML Logistics Prediction

Testing ML Engine factory prediction...
✅ PASS - ML Factory Prediction

[... more tests ...]

==========================================
📊 Test Results Summary
==========================================

Total Tests: 15
Passed: 15
Failed: 0

==========================================
✅ SUCCESS - All tests passed!
==========================================

🎉 Carbon Nexus platform is fully integrated!
```

### Failure

```
❌ FAIL - ML Engine Health Check
   Error: Connection refused

==========================================
❌ FAILURE - Some tests failed
==========================================

Please check the errors above and:
  1. Verify all services are running: docker-compose ps
  2. Check service logs: docker-compose logs [service-name]
  3. Verify .env files are configured correctly
  4. Ensure all dependencies are installed
```

## Test Details

### Test 1: Service Health Checks

**Purpose**: Verify all services are running and responding

**Endpoints Tested**:
- `GET http://localhost:8001/api/v1/health` - ML Engine
- `GET http://localhost:8002/health` - Data Core
- `GET http://localhost:8003/health` - Orchestration Engine
- `GET http://localhost:8004/health` - RAG Chatbot
- `GET http://localhost:5173` - Frontend UI

**Expected**: HTTP 200 OK from all endpoints

### Test 2: ML Prediction Pipeline

**Purpose**: Verify ML models are loaded and making predictions

**Test 2.1: Logistics Prediction**
```bash
POST http://localhost:8001/api/v1/predict/logistics
Content-Type: application/json

{
  "distance_km": 100,
  "load_kg": 200,
  "vehicle_type": "truck_diesel",
  "fuel_type": "diesel",
  "avg_speed": 60
}
```

**Expected Response**:
```json
{
  "prediction": 45.2,
  "model": "logistics",
  "confidence": 0.95
}
```

**Test 2.2: Factory Prediction**
```bash
POST http://localhost:8001/api/v1/predict/factory
Content-Type: application/json

{
  "energy_kwh": 500,
  "furnace_usage": 8,
  "cooling_load": 200,
  "shift_hours": 8
}
```

### Test 3: Data Ingestion Pipeline

**Purpose**: Verify data can be ingested and processed

**Request**:
```bash
POST http://localhost:8002/ingest/event
Content-Type: application/json

{
  "source": "test",
  "event_type": "logistics",
  "data": {
    "distance_km": 150,
    "load_weight_kg": 300,
    "vehicle_type": "truck_diesel",
    "supplier_name": "Test Supplier",
    "route_id": "TEST-001"
  }
}
```

**Expected**: HTTP 200 OK with event ID

### Test 4: Orchestration Pipeline

**Purpose**: Verify orchestration engine can coordinate services

**Tests**:
- Get hotspots: `GET /hotspots`
- Get alerts: `GET /alerts`
- Get recommendations: `GET /recommendations`
- Trigger scan: `POST /hotspots/scan`

### Test 5: RAG Recommendation Pipeline

**Purpose**: Verify AI recommendations are generated

**Request**:
```bash
POST http://localhost:8004/api/recommendations
Content-Type: application/json

{
  "entity": "Test Supplier",
  "predicted": 85.5,
  "baseline": 60.0,
  "context": "Emissions 42.5% above baseline"
}
```

**Expected**: Recommendations with actions and CO2 reduction estimates

### Test 6: WebSocket Connectivity

**Purpose**: Verify real-time feeds are available

**Endpoints**:
- `ws://localhost:8003/ws/hotspots`
- `ws://localhost:8003/ws/alerts`
- `ws://localhost:8003/ws/recommendations`

**Note**: Requires `websocat` or `wscat` installed

### Test 7: Service Integration

**Purpose**: Verify services can communicate with each other

**Tests**:
- Orchestration can reach ML Engine
- Orchestration can reach Data Core
- Service-to-service network connectivity

## Troubleshooting

### All Tests Fail

**Cause**: Services not running

**Solution**:
```bash
# Check if services are running
docker-compose ps

# Start services if not running
docker-compose up -d

# Wait for services to be ready
sleep 60

# Run tests again
./integration_test.sh
```

### Specific Service Fails

**Cause**: Service crashed or misconfigured

**Solution**:
```bash
# Check service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Check service health manually
curl http://localhost:[port]/health
```

### Connection Refused Errors

**Cause**: Service not listening on expected port

**Solution**:
```bash
# Verify port mappings
docker-compose ps

# Check if port is in use
lsof -i :[port]

# Verify .env file has correct PORT setting
cat [service]/.env | grep PORT
```

### Prediction Tests Fail

**Cause**: ML models not loaded

**Solution**:
```bash
# Check ML Engine logs
docker-compose logs ml-engine

# Verify models exist
docker-compose exec ml-engine ls -la /app/models

# Retrain models if needed
docker-compose exec ml-engine python train_models.py
```

### RAG Tests Fail

**Cause**: Missing API keys or vector database

**Solution**:
```bash
# Check RAG configuration
cat rag_chatbot_plugin/.env

# Verify GEMINI_API_KEY is set
# Verify QDRANT_URL is accessible
# Check RAG logs
docker-compose logs rag-chatbot
```

### WebSocket Tests Skipped

**Cause**: `websocat` or `wscat` not installed

**Solution**:
```bash
# Install wscat
npm install -g wscat

# Or install websocat
brew install websocat  # macOS
```

## Manual Testing

### Test Individual Endpoints

```bash
# ML Engine
curl http://localhost:8001/api/v1/health

# Data Core
curl http://localhost:8002/health

# Orchestration
curl http://localhost:8003/health

# RAG Chatbot
curl http://localhost:8004/health

# Frontend
curl http://localhost:5173
```

### Test Predictions

```bash
# Logistics prediction
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 100,
    "load_kg": 200,
    "vehicle_type": "truck_diesel",
    "fuel_type": "diesel",
    "avg_speed": 60
  }'
```

### Test WebSocket

```bash
# Using wscat
wscat -c ws://localhost:8003/ws/hotspots

# Using websocat
websocat ws://localhost:8003/ws/hotspots
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: sleep 60
      
      - name: Run integration tests
        run: ./integration_test.sh
      
      - name: Stop services
        run: docker-compose down
```

## Best Practices

1. **Run tests after deployment**: Verify everything works after changes
2. **Run tests before demos**: Ensure platform is ready
3. **Check logs on failure**: Use `docker-compose logs` to debug
4. **Test incrementally**: Test each service individually first
5. **Keep services updated**: Ensure all dependencies are current

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

Use in scripts:
```bash
./integration_test.sh
if [ $? -eq 0 ]; then
    echo "Ready for demo!"
else
    echo "Fix issues before proceeding"
    exit 1
fi
```

## Next Steps

After successful integration tests:
1. ✅ All services are running
2. ✅ Services can communicate
3. ✅ ML predictions work
4. ✅ Data ingestion works
5. ✅ Recommendations work
6. ✅ WebSockets available

**You're ready to use the platform!** 🎉

Access the frontend at: http://localhost:5173
