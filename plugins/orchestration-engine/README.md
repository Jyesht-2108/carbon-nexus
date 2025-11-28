# Carbon Nexus - Orchestration Engine

The **Orchestration Engine** is the central hub of the Carbon Nexus platform, connecting all plugins and providing unified intelligence.

## 🎯 Purpose

The Orchestration Engine:
- Fetches predictions from ML Engine
- Detects emission hotspots in real-time
- Generates alerts for anomalies
- Calls RAG Chatbot for AI-powered recommendations
- Serves unified REST API to Frontend
- Provides WebSocket real-time updates
- Supports what-if scenario simulation

## 🏗️ Architecture

```
Frontend (Port 3000)
    ↓ REST + WebSocket
Orchestration Engine (Port 8000)
    ↓ HTTP
    ├─→ Data Core (Port 8002) - Get normalized events
    ├─→ ML Engine (Port 8001) - Get predictions
    └─→ RAG Chatbot (Port 4000) - Get recommendations
```

## 📦 Features

### ✅ Hotspot Detection
- Real-time emission anomaly detection
- Configurable thresholds (INFO, WARN, CRITICAL)
- Baseline comparison
- Automatic alert generation

### ✅ Alert Management
- Multi-level alerts (info, warn, critical)
- Alert history and statistics
- Acknowledgment tracking

### ✅ Recommendation Integration
- AI-powered recommendations via RAG
- Approval/rejection workflow
- CO₂ reduction tracking
- Audit trail

### ✅ What-If Simulation
- Scenario testing
- Impact prediction
- Batch simulation support

### ✅ Dashboard API
- Current emission pulse
- 7-day forecasting
- Summary statistics
- Real-time updates

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd plugins/orchestration-engine
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
SUPABASE_URL=https://azpbgjfsnmepzxofxitu.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ML_ENGINE_URL=http://localhost:8001
DATA_CORE_URL=http://localhost:8002
RAG_SERVICE_URL=http://localhost:4000
API_PORT=8003
```

### 3. Create Database Tables

Run the SQL schema in Supabase:

```bash
# Copy contents of sql/schema.sql and run in Supabase SQL Editor
```

### 4. Start the Service

```bash
python -m src.main
```

The service will start on `http://localhost:8003`

## 📡 API Endpoints

### Dashboard
- `GET /emissions/current` - Current emission rate
- `GET /emissions/forecast` - 7-day forecast
- `GET /emissions/summary` - Summary statistics

### Hotspots
- `GET /hotspots` - Get all hotspots
- `GET /hotspots/top` - Get top hotspots
- `POST /hotspots/scan` - Trigger manual scan
- `GET /hotspots/stats` - Hotspot statistics

### Recommendations
- `GET /recommendations` - Get all recommendations
- `GET /recommendations/pending` - Get pending recommendations
- `POST /recommendations/{id}/approve` - Approve recommendation
- `POST /recommendations/{id}/reject` - Reject recommendation
- `GET /recommendations/stats` - Recommendation statistics

### Alerts
- `GET /alerts` - Get all alerts
- `GET /alerts/critical` - Get critical alerts only
- `GET /alerts/stats` - Alert statistics

### Simulation
- `POST /simulate` - Run what-if scenario
- `POST /simulate/batch` - Run multiple scenarios

### Health
- `GET /health` - Health check
- `GET /` - Service info

## 🔧 Configuration

### Hotspot Thresholds

Configure in `.env`:

```env
THRESHOLD_INFO=0.8      # 80% above baseline
THRESHOLD_WARN=1.0      # 100% above baseline
THRESHOLD_CRITICAL=1.5  # 150% above baseline
```

### Scheduler Intervals

```env
HOTSPOT_CHECK_INTERVAL=300   # 5 minutes
BASELINE_RECALC_INTERVAL=3600  # 1 hour
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:8003/health
```

### Get Current Emissions

```bash
curl http://localhost:8003/emissions/current
```

### Trigger Hotspot Scan

```bash
curl -X POST http://localhost:8003/hotspots/scan
```

### Run Simulation

```bash
curl -X POST http://localhost:8003/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_type": "logistics",
    "baseline_features": {
      "distance_km": 120,
      "load_kg": 450,
      "vehicle_type": "truck_diesel",
      "fuel_type": "diesel",
      "avg_speed": 50
    },
    "changes": {
      "vehicle_type": "truck_ev",
      "fuel_type": "electric"
    }
  }'
```

## 📊 Database Tables

The orchestration engine uses these Supabase tables:

- `hotspots` - Detected emission hotspots
- `alerts` - Generated alerts
- `baselines` - Entity baseline emissions
- `predictions` - Cached ML predictions
- `audit_logs` - Action audit trail

See `sql/schema.sql` for complete schema.

## 🔄 Integration

### With Data Core

The orchestration engine monitors `events_normalized` table for new data and automatically triggers prediction flow.

### With ML Engine

Calls ML Engine prediction endpoints:
- `/predict/logistics`
- `/predict/factory`
- `/predict/warehouse`
- `/predict/delivery`
- `/forecast/7d`

### With RAG Chatbot

Calls RAG service for recommendations:
- `POST /api/rag/recommend` - Generate recommendations

### With Frontend

Provides REST API and WebSocket updates for real-time dashboard.

## 📝 Logging

Logs are written to:
- Console (stdout)
- `logs/orchestration_YYYY-MM-DD.log`

Configure log level in `.env`:
```env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

## 🐳 Docker Support

```bash
# Build
docker build -t carbon-nexus-orchestration .

# Run
docker run -p 8000:8000 --env-file .env carbon-nexus-orchestration
```

## 🔐 Security

- Uses Supabase service role key (backend only)
- CORS configured for production
- Input validation on all endpoints
- Audit logging for all actions

## 📈 Performance

- Async/await for non-blocking operations
- Connection pooling for database
- Efficient caching of predictions
- Scheduled background tasks

## 🛠️ Development

### Project Structure

```
plugins/orchestration-engine/
├── src/
│   ├── api/
│   │   ├── routes_dashboard.py
│   │   ├── routes_hotspots.py
│   │   ├── routes_recommendations.py
│   │   ├── routes_simulation.py
│   │   └── routes_alerts.py
│   ├── services/
│   │   ├── ml_client.py
│   │   ├── rag_client.py
│   │   ├── hotspot_engine.py
│   │   └── scheduler.py
│   ├── db/
│   │   └── supabase_client.py
│   ├── utils/
│   │   ├── config.py
│   │   └── logger.py
│   └── main.py
├── sql/
│   └── schema.sql
├── requirements.txt
├── .env.example
└── README.md
```

## 🎯 Next Steps

1. ✅ Core implementation complete
2. ⏳ WebSocket server for real-time updates
3. ⏳ Advanced baseline calculation
4. ⏳ Batch processing optimization
5. ⏳ Metrics and monitoring

## 📚 Documentation

- Architecture: `doc/orchestration_engine_architecture.md`
- Extended features: `doc/orchestration_engine_architecture_continuation.md`
- Session context: `SESSION_SUMMARY.md`

## 🆘 Troubleshooting

### Service won't start
- Check `.env` configuration
- Verify Supabase credentials
- Ensure port 8000 is available

### ML Engine connection error
- Verify ML Engine is running on port 8001
- Check `ML_ENGINE_URL` in `.env`

### RAG service connection error
- Verify RAG Chatbot is running on port 4000
- Check `RAG_SERVICE_URL` in `.env`

### No hotspots detected
- Check if events exist in `events_normalized`
- Verify baselines are configured
- Check threshold settings

## 📞 Support

For issues or questions, check:
- `SESSION_SUMMARY.md` - Complete context
- `QUICK_REFERENCE.md` - Quick commands
- API docs at `http://localhost:8000/docs`

---

**Status:** ✅ Core Implementation Complete  
**Version:** 1.0.0  
**Last Updated:** 2025-11-28
