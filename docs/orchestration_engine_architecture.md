# Orchestration Engine Plugin Architecture (orchestration-engine)

This document defines the complete architecture for the **Carbon Nexus Orchestration Engine Plugin**.  
This is the **central backend logic** that connects all other plugins:
- ml-engine (predictions)
- data-core (clean data from DB)
- rag-chatbot (recommendation reasoning)
- ws-server (real-time push)
- frontend-ui (consumer of API responses)

This plugin provides:
- Hotspot detection
- Alert generation
- Recommendation aggregation
- Scenario simulation
- Unified REST API for frontend
- WebSocket bridging

This plugin will be implemented by **Team Member 4**.

---

# 1. Purpose of the Orchestration Engine

This plugin serves as the **brains** of the Carbon Nexus backend. It does **NOT**:
- Train ML models
- Clean raw data
- Handle RAG (only calls its API)

It focuses on **business logic and orchestration**, connecting all other services.

### Responsibilities:
1. Fetch predictions from **ml-engine**
2. Fetch normalized data from **data-core (via Supabase DB)**
3. Detect **real-time hotspots**
4. Generate **alerts**
5. Call **rag-chatbot plugin** for root cause & recommendations
6. Serve unified **REST API** to frontend
7. Broadcast updates via **WebSocket server**
8. Support **What-if scenario simulation**

---

# 2. Technology Stack

| Component | Library |
|-----------|---------|
| API Framework | **FastAPI** |
| DB | **Supabase Python SDK** |
| HTTP Client | **httpx** |
| Scheduler | APScheduler |
| Realtime | WebSocket client or Socket.IO |
| Logging | Loguru |

---

# 3. Folder Structure

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
  │   │   ├── data_core_client.py
  │   │   ├── rag_client.py
  │   │   ├── ws_push.py
  │   │   └── hotspot_engine.py
  │   ├── db/
  │   │   ├── supabase_client.py
  │   │   └── queries.py
  │   ├── utils/
  │   │   ├── logger.py
  │   │   └── config.py
  │   ├── main.py
  │   ├── scheduler.py
  ├── requirements.txt
  └── Dockerfile
```

---

# 4. Core Functional Flows

## 4.1 Fetching Data → Predict → Detect Hotspots

```
Supabase events → Orchestration → ml-engine → predictions → hotspot detection → alerts → WebSocket push → frontend
```

### Detailed Steps:
1. Load latest normalized events from `events_normalized`
2. For each event:
   - Call ml-engine for prediction
3. Compare predictions against baselines stored in DB
4. If > baseline threshold → mark as hotspot
5. Insert hotspot + alert into Supabase
6. Push to WebSocket server

---

# 5. Hotspot Detection (hotspot_engine.py)

A hotspot is triggered when:
```
predicted_co2 > baseline * threshold_multiplier
```

Example thresholds:
- INFO: 80%
- WARN: 100%
- CRITICAL: 150%

### Hotspot Object Structure:
```json
{
  "entity": "Supplier A",
  "entity_type": "supplier",
  "predicted": 122,
  "baseline": 60,
  "percent_above": 120,
  "severity": "critical"
}
```

All hotspots are saved to **hotspots** table.

---

# 6. Alerts Engine

When a hotspot is detected:
1. Generate alert object
2. Insert into `alerts` table
3. Broadcast to WebSocket channel

Alert Format:
```json
{
  "level": "critical",
  "message": "Supplier A exceeded emissions by 120%",
  "hotspot_id": 34
}
```

---

# 7. Recommendation Engine Integration (rag_client.py)

The orchestration engine:
1. Sends hotspot summary to rag-chatbot plugin
2. RAG returns:
   - root cause
   - top recommendations (ranked)
3. Orchestration stores them in `recommendations` table
4. Sends real-time update via WS

Request to RAG:
```json
{
  "entity": "Supplier A",
  "data": { "predicted": 120, "baseline": 60 }
}
```

Response:
```json
{
  "root_cause": "Increased load due to holiday demand.",
  "actions": [
    {
      "title": "Shift 20% load to Supplier B",
      "co2_reduction": 18,
      "cost_impact": 2,
      "feasibility": 9
    }
  ]
}
```

---

# 8. What-If Scenario Simulator

API: `POST /simulate`

### Input:
```json
{
  "vehicle_type": "ev",
  "route": "R12",
  "load_change": -20
}
```

### Process:
1. Apply changes to event features
2. Send modified features to ml-engine
3. Return:
   - new CO₂
   - delta

### Output:
```json
{ "new_value": 120, "delta": -32 }
```

---

# 9. REST API Endpoints

### Dashboard Endpoints
```
GET /emissions/current
GET /hotspots
GET /recommendations
GET /alerts
POST /simulate
```

These endpoints are the **only ones** the frontend will call.

---

# 10. WebSocket Push Service

Two options:
- Direct WebSocket connection
- Socket.IO bridge

### Channels:
- `emissions`
- `hotspots`
- `alerts`
- `recommendations`

Functions:
```python
ws_push.send("hotspots", hotspot_payload)
ws_push.send("alerts", alert_payload)
```

---

# 11. Scheduler (Optional)

Using **APScheduler**:
- Every 5 minutes: run hotspot detection cycle
- Every 1 hour: recalc baselines

---

# 12. Supabase Queries

Key tables used:
- events_normalized
- hotspots
- alerts
- recommendations
- baselines

Queries in `queries.py`:
- `get_recent_events()`
- `insert_hotspot()`
- `insert_alert()`
- `insert_recommendation()`

---

# 13. Deliverables

### Minimum
- Fully working REST API
- Hotspot engine implemented
- Alert engine implemented
- RAG client integrated
- WebSocket push integrated
- What-if simulator functional
- Dockerfile

### Optional
- Batch hotspot detection
- Multi-supplier comparison API

---

# 14. Summary

The **orchestration-engine plugin** acts as the central hub that brings the whole system together. It is the most important backend plugin for real-time intelligence and is fully isolated so that it can be easily implemented and later integrated by AI.

---

When ready, say:
- "Generate folder skeleton for orchestration-engine"
- "Generate hotspot detection code"
- "Create API routes for dashboard"