# Integration Test Quick Reference

## 🚀 Run Tests

```bash
./integration_test.sh
```

## ✅ What It Tests

| Category | Tests | Endpoints |
|----------|-------|-----------|
| **Health Checks** | 5 | All service health endpoints |
| **ML Predictions** | 2 | Logistics & Factory models |
| **Data Ingestion** | 1 | Event ingestion pipeline |
| **Orchestration** | 4 | Hotspots, Alerts, Recommendations |
| **RAG** | 1 | AI recommendation generation |
| **WebSocket** | 1 | Real-time feed connectivity |
| **Integration** | 2 | Inter-service communication |

**Total**: ~16 automated tests

## 📊 Expected Results

### Success ✅
```
==========================================
✅ SUCCESS - All tests passed!
==========================================

Total Tests: 16
Passed: 16
Failed: 0

🎉 Carbon Nexus platform is fully integrated!
```

### Failure ❌
```
==========================================
❌ FAILURE - Some tests failed
==========================================

Total Tests: 16
Passed: 12
Failed: 4
```

## 🔧 Quick Troubleshooting

### All Tests Fail
```bash
# Check services
docker-compose ps

# Start services
docker-compose up -d

# Wait and retry
sleep 60
./integration_test.sh
```

### Specific Service Fails
```bash
# Check logs
docker-compose logs [service-name]

# Restart service
docker-compose restart [service-name]

# Test manually
curl http://localhost:[port]/health
```

### Connection Refused
```bash
# Verify ports
docker-compose ps

# Check port conflicts
lsof -i :[port]
```

## 📝 Manual Tests

```bash
# Health checks
curl http://localhost:8001/api/v1/health  # ML Engine
curl http://localhost:8002/health         # Data Core
curl http://localhost:8003/health         # Orchestration
curl http://localhost:8004/health         # RAG Chatbot
curl http://localhost:5173                # Frontend

# ML Prediction
curl -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{"distance_km":100,"load_kg":200,"vehicle_type":"truck_diesel"}'

# WebSocket
wscat -c ws://localhost:8003/ws/hotspots
```

## 🎯 Exit Codes

- `0` = All tests passed ✅
- `1` = Some tests failed ❌

## 📚 Full Documentation

- [INTEGRATION_TEST_GUIDE.md](INTEGRATION_TEST_GUIDE.md) - Complete guide
- [INTEGRATION_TEST_SUMMARY.md](INTEGRATION_TEST_SUMMARY.md) - Implementation details

## 🚀 Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for ready
sleep 60

# 3. Run tests
./integration_test.sh

# 4. If pass, ready to use!
# If fail, check logs and fix
```
