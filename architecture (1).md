# Carbon Nexus — Architecture

> Finalized architecture for the hackathon-ready Carbon Nexus system.

This document describes the end-to-end architecture for the **Carbon Nexus** product you finalized: React + TypeScript frontend (UI matching the provided mock), Python backend services, Supabase as primary DB, existing RAG chatbot (Qdrant + LangChain + Gemini) already integrated, Gemini API key for reasoning/LM calls, and MCP server migrating from MySQL → Supabase.

---

## 1. High-level overview

**Goal:** Real-time carbon intelligence across supply chains. Provide ML-based emission predictions, hotspot detection, data-quality transparency (gap detection + basic gap-filling), 7-day forecasting, interactive heatmap and charts, real-time alerts, a what-if simulator and recommendation queue. RAG / Gemini reasoning (already available) will be used for root cause analysis and recommendation generation.

**Primary components:**

- **Frontend (React + TypeScript)** — interactive dashboard UI closely matching the provided image: cards, donut chart, gauge, heatmap, time-series chart, recommendation queue, activity feed, data-quality widget, controls.
- **Backend (Python)** — set of microservices/APIs: MCP (data ingestion, orchestration, scheduling, authentication), ML inference service(s), data-quality & gap-filling service, WebSocket server for live push, supervisor for scheduled tasks.
- **Database (Supabase)** — primary relational store (Postgres) for events, metadata, ML outputs, predictions, alerts, recommendations, audit logs. Supabase also provides auth, storage and Row Level Security if needed.
- **RAG Chatbot (existing)** — Qdrant + LangChain + Gemini integrated and available. This is used for complex reasoning, root cause explanation, compliance checks and generating recommendation content. No need to rebuild.
- **Gemini API** — used where direct LLM calls or specialized reasoning are required (e.g., summary generation, short explanations). Your RAG pipeline will already call Gemini via API key for retrieval-augmented reasoning.
- **Deployment & infra** — Docker, optional Kubernetes or managed containers, CI/CD (GitHub Actions), monitoring & logging.

---

## 2. Logical architecture & dataflow

1. **Data ingestion**
   - Mock data stream (MCP) simulates transport, factory, warehouse, delivery events. Accepts CSV upload, REST API ingestion, and WebSocket ingestion.
   - MCP performs initial validation, tags events with `data_source` and `quality_status`.

2. **Storage**
   - Raw events stored in `events_raw` (Supabase storage or table). A daily retention policy keeps full history for demo; move to cold storage if needed.

3. **Preprocessing & Data Quality**
   - Data-quality service reads raw events, performs outlier detection (IQR/DBSCAN), flags anomalies, calculates `% data completeness` per supplier and per timeslice.
   - If gaps detected, the gap-filler service runs a simple regression (trained offline) to produce predicted values and attach `confidence_score` + `predicted_by` metadata.

4. **ML Inference**
   - ML models (logistics XGBoost, factory LSTM/regression, warehouse regression, last-mile regression) run as Python services. They accept normalized inputs, return CO₂ estimates and optional explainability data (feature importance scores).

5. **Forecasting**
   - Time-series model provides 7-day forecasts and returns confidence bands.

6. **Hotspot detection & Alerts**
   - Rules engine scans recent predictions every 5 minutes, detects top hotspots, and writes alerts into `alerts` table. Alerts push to WebSocket channel and appear in dashboard.

7. **Recommendation & RAG**
   - When hotspots appear, the MCP orchestrator sends a condensed data payload (ML outputs, recent event history, supplier metadata) to your RAG system. The RAG system returns root-cause analysis and ranked recommendations. RAG outputs are persisted to `recommendations` with `confidence`, `cost_estimate`, `co2_impact`.

8. **Frontend**
   - Subscribes to WebSocket channels for live updates (emissions pulse, hotspots, alerts). Fetches historical/paginated data from Supabase REST endpoints for charts and drill-downs.

9. **Audit & Reporting**
   - All actions (alert ack, recommendation approve, scenario simulate) are logged in `audit_log` for traceability and demo playback.

---

## 3. Component breakdown (detailed)

### 3.1 Frontend — React + TypeScript

**Main pages / components:**
- `AppShell` — left nav (home, activity, goals, settings, CSV import) matching visual mock, top bar with date-picker and profile.
- `Dashboard` — composite page containing the following widgets:
  - `DonutCategoryCard` — CO₂ by category (center value). Interactivity: hover slices, click to filter timeline.
  - `EmissionPulseCard` — current kg CO₂/hr, trend arrow, delta vs target.
  - `GaugeSavedCard` — meter like the mock showing total saved vs goal.
  - `Heatmap` — interactive map or topological hotspot visualization (Mapbox or simple D3 grid for demo). Animated updates on websocket messages.
  - `HotspotList` — ranked list of hotspots with % above baseline and quick actions.
  - `RecommendationQueue` — cards showing recommendation, CO₂ impact, cost, feasibility, one-click approve/dismiss.
  - `ActivityFeed` — latest activities (transactions) with small CO₂ numbers on the side.
  - `ForecastChart` — time series with predicted band and annotations.
  - `DataQualityBadge` — small widget showing 'X% Real | Y% Predicted' and link to data quality panel.
  - `WhatIfSimulatorModal` — change parameters, simulate via POST `/simulate` and show delta.

**State & data flow:**
- Global store via React Query (for server state) + Context for ephemeral UI state.
- WebSocket client for push (socket.io or native WS). WebSocket updates update React Query cache via mutation.

**Styling & charting:**
- Tailwind or styled-components + CSS variables to match mock (rounded white cards on teal background). Use Chart.js or Recharts for charts; Mapbox/Deck.gl or D3 for heatmap. Prioritize fast integration and look.

**Accessibility & responsiveness:**
- Desktop-first demo, responsive down to tablet. Focus on readability.

---

### 3.2 Backend — Python microservices

**Service decomposition:**
- `mcp-api` (FastAPI)
  - Auth (JWT via Supabase or internal) for admin & users
  - Ingestion endpoints: `/ingest/csv`, `/ingest/event`, `/stream/ws`
  - Orchestration endpoints used by frontend
  - WebSocket gateway or uses a separate `ws-server`

- `ml-service` (FastAPI)
  - `/predict/logistics`, `/predict/factory`, `/predict/warehouse`, `/predict/delivery`
  - `/forecast/7d`
  - Model artifacts (joblib, torch) kept in `/models`

- `data-quality-service` (Python worker)
  - Periodic tasks: compute completeness, detect outliers, call gap-filler
  - Writes results to `data_quality` tables

- `gap-filler` (Python)
  - Lightweight regression model for missing values
  - Returns `{value, confidence, method: 'regression'}`

- `alert-engine` (Python worker)
  - Runs baseline comparisons and inserts alerts
  - Triggers push events for WebSockets

- `ws-server` (if separated)
  - Pushes real-time messages to browser clients
  - Can be implemented with `FastAPI` + `WebSockets` or `socket.io` server

**Communication:** REST between frontend and services; internal services can communicate via HTTP or message queue (Redis pub/sub) for scale.

**Scheduling:**
- Use `APScheduler` or `Celery` (with Redis broker) for scheduled daily predictions and gap-filling.

**Model training:**
- Offline training step: a separate repo/process that produces model artifacts. For hackathon, synthetic datasets + small training script suffices.

---

### 3.3 Database (Supabase / Postgres design)

**Key tables (abbreviated):**

- `events_raw` (id, supplier_id, timestamp, payload JSONB, data_source, created_at)
- `events_normalized` (id, event_type, supplier_id, distance_km, load_kg, vehicle_type, fuel_type, speed, timestamp, created_at)
- `predictions` (id, model, input_hash, output_co2_kg, confidence, feature_importance JSONB, created_at)
- `forecasts` (id, model, horizon_days, series JSONB, created_at)
- `hotspots` (id, entity_type, entity_id, metric_value, baseline, percent_above, detected_at, status)
- `alerts` (id, hotspot_id, level, message, acknowledged_by, acknowledged_at, created_at)
- `recommendations` (id, hotspot_id, title, body, co2_impact, cost_estimate, feasibility_score, status, created_at)
- `suppliers` (id, name, location JSONB, baseline_emission, fleet_info JSONB, last_seen_at)
- `data_quality` (id, supplier_id, window_start, completeness_pct, predicted_pct, anomalies_count, created_at)
- `audit_logs` (id, user_id, action, metadata JSONB, created_at)

**Indexes & partitioning:**
- Index `events_normalized(timestamp)` and `predictions(created_at)`.
- Partition events by day if volume is high, but for hackathon keep simple single table.

**Supabase features to use:**
- Authentication (magic links / JWT) for demo users
- Row Level Security (optional) to restrict supplier data in multi-tenant demos
- Storage for saved CSVs and static artifacts

---

### 3.4 RAG / Gemini Integration (already ready)

You said the RAG + Qdrant + LangChain + Gemini integration is ready. Integration points:

- **Input**: RAG accepts condensed payloads about hotspot (ML outputs + last 48h events + supplier metadata).
- **Output**: Root-cause analysis, suggestions, recommended actions and short summaries.
- **Persistence**: RAG results saved to `recommendations`.
- **Fallback**: If RAG is slow, show pre-computed rule-based recommendation.

No rebuild necessary — only ensure secure API endpoints exist for MCP to call RAG.

---

## 4. API specification (selected endpoints)

Use OpenAPI via FastAPI. Minimal required endpoints:

- `POST /ingest/csv` — upload CSV (returns processing job id)
- `POST /ingest/event` — push single mock event
- `GET /emissions/current` — returns current emission pulse (kg CO₂/hr) + breakdown
- `GET /emissions/forecast` — returns 7-day forecast
- `GET /hotspots` — returns top hotspots
- `GET /recommendations` — returns open/closed recommendations
- `POST /recommendations/{id}/approve` — approve an action
- `POST /simulate` — run a what-if scenario (request body with scenario changes)
- `GET /data-quality` — data completeness metrics
- WebSocket `/ws` — channels: `emissions`, `hotspots`, `alerts`, `recommendations`

**Auth:** JWT tokens issued by Supabase or internal auth. Inject Gemini API key only on server-side; never expose in frontend.

---

## 5. Security & Keys

- Gemini API key: store in backend env / Supabase secrets. Use server-side calls only.
- RAG credentials for Qdrant kept in server env.
- Supabase keys: use service_role for server-side; anon key used only for safe public reads if necessary.
- JWT / role-based authentication for approve/dismiss actions.
- Use HTTPS in production; CORS restricted to your demo origin.

---

## 6. Deployment & infra

**Local/hackathon deployment:**
- Docker Compose with services: `mcp-api`, `ml-service`, `data-quality-service`, `ws-server`, `supabase (managed)`, `qdrant (if not remote)`, `frontend`.

**Cloud-ready:**
- Host backend on a managed container service (AWS ECS / GCP Cloud Run / Azure Container Apps). Use Supabase hosted DB. Use managed Qdrant if needed.
- Use GitHub Actions for CI: build images, run unit tests, push to registry, and optionally deploy.
- Monitoring: use Prometheus/Grafana or simple hosted logs. Use Sentry for error tracking.

---

## 7. Observability & testing

- **Unit tests:** model input/output validation, small backend endpoints
- **Integration tests:** ingest → predict → hotspot detection → RAG call
- **E2E test for demo:** script that seeds the mock stream to trigger a hotspot and verifies the recommended card appears.
- **Logging & tracing:** structured logs (JSON), correlation ids for events, slow query logs, model latency metrics.

---

## 8. Minimum viable demo flow (24-hour friendly)

1. Start Supabase + backend services + frontend (Docker compose).
2. Start mock stream; stream emits synthetic data with a planned hotspot scenario at minute ~10.
3. Show live dashboard: emission pulse & animated heatmap reacting to stream.
4. Hotspot fires → alert pops → recommendation appears (from RAG).
5. Open recommendation queue → approve a suggestion; log action appears in audit.
6. Open what-if simulator → apply change and show CO₂ delta.
7. Show data-quality badge (X% Real vs Predicted) and peek into gap-filler predictions.

---

## 9. Migration notes: MySQL (existing MCP) → Supabase (Postgres)

- Export MySQL data as CSV and import into Supabase tables.
- Align schema types (datetime, JSONB) and reindex.
- Update MCP connection string and credential management.
- For the demo, you can keep MySQL for legacy tables and write a small sync task to copy necessary subsets into Supabase.

---

## 10. Module list (ready for your next instruction)

When you ask to "create multiple modules for implementation," I will split into these modules (each module will contain tasks, APIs, minimal tests, and demo scripts):

1. **frontend/ui** — React components, websockets, styling, chart integration
2. **mcp-api** — ingestion endpoints, auth, job orchestration
3. **ml-service** — model server + predict endpoints + forecast
4. **data-quality** — completeness, outlier detection, gap-filling service
5. **alert-engine** — hotspot detection rules + alert insert + push
6. **ws-server** — WebSocket push server or integrated into `mcp-api`
7. **recommendation-adapter** — bridges MCP to RAG service and persists results
8. **db-migrations** — Supabase table creation scripts & seed data
9. **ci-cd** — Dockerfile, Compose, and GitHub Actions for builds
10. **demo-scripts** — mock stream generator and demo scenario deck

---

## 11. Next steps

When you're ready I will:

- Produce the **module-by-module implementation plan** with file structure, key endpoints, and minimal code samples.
- Or produce **UI component code scaffolding** for the dashboard matching the image (React + TS + simple chart scaffolding).

Tell me which module you want to start with and I will create a focused plan and code scaffolding.

---

*End of architecture.md*

