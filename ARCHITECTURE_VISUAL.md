# Carbon Nexus - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                         Port: 3000                               │
│  Dashboard | Heatmap | Recommendations | What-If | Alerts       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION ENGINE (FastAPI)                 │
│                         Port: 8000                               │
│  ✅ Hotspot Detection | Alerts | Recommendations | WebSocket    │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ HTTP               │ HTTP               │ HTTP
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   DATA CORE      │  │   ML ENGINE      │  │  RAG CHATBOT     │
│   Port: 8002     │  │   Port: 8001     │  │  Port: 4000      │
│   ✅ COMPLETE    │  │   🔄 TEAMMATE    │  │  ✅ COMPLETE     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ • CSV Upload     │  │ • Logistics      │  │ • PDF Upload     │
│ • Normalization  │  │ • Factory        │  │ • Q&A            │
│ • Outlier Det.   │  │ • Warehouse      │  │ • Recommend      │
│ • Gap Filling    │  │ • Delivery       │  │ • Gemini AI      │
│ • Quality        │  │ • Forecasting    │  │ • Qdrant         │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                                            │
         │                                            │
         └────────────────┬───────────────────────────┘
                          ▼
                 ┌─────────────────┐
                 │    SUPABASE     │
                 │   (PostgreSQL)  │
                 └─────────────────┘
```

---

## 📊 Data Flow

### 1. Ingestion Flow
```
User uploads CSV
    ↓
Data Core (Port 8002)
    ├─ Validate
    ├─ Normalize
    ├─ Detect Outliers
    ├─ Fill Gaps
    └─ Store in Supabase
        ↓
    events_normalized table
```

### 2. Prediction Flow
```
Orchestration Engine
    ↓
Fetch events from Supabase
    ↓
Call ML Engine (Port 8001)
    ├─ Logistics Model
    ├─ Factory Model
    ├─ Warehouse Model
    └─ Delivery Model
        ↓
    Store predictions
```

### 3. Hotspot Detection Flow
```
Orchestration Engine
    ↓
Compare predictions vs baselines
    ↓
Detect anomalies (>80%, >100%, >150%)
    ↓
Insert into hotspots table
    ↓
Generate alerts
    ↓
Push to WebSocket
```

### 4. Recommendation Flow
```
Hotspot detected
    ↓
Orchestration Engine
    ↓
POST /api/rag/recommend (Port 4000)
    ├─ Send hotspot context
    └─ Gemini AI generates recommendations
        ↓
    Structured JSON response
        ↓
    Store in recommendations table
        ↓
    Push to WebSocket
        ↓
    Frontend displays cards
```

---

## 🗄️ Database Schema

### Supabase Tables

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA CORE TABLES                        │
├─────────────────────────────────────────────────────────────┤
│ events_raw          │ Raw ingested data                     │
│ events_normalized   │ Cleaned & normalized data             │
│ data_quality        │ Quality metrics per supplier          │
│ ingest_jobs         │ Upload job tracking                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RAG CHATBOT TABLES                        │
├─────────────────────────────────────────────────────────────┤
│ uploads             │ Uploaded PDF documents                │
│ ingestion_jobs      │ Document processing status            │
│ recommendations     │ AI-generated recommendations          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATION ENGINE TABLES (TO CREATE)         │
├─────────────────────────────────────────────────────────────┤
│ hotspots            │ Detected emission hotspots            │
│ alerts              │ Generated alerts                      │
│ baselines           │ Supplier baseline emissions           │
│ predictions         │ ML prediction cache                   │
│ audit_logs          │ Action tracking                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Data Core (Port 8002)
```
POST   /api/v1/ingest/csv              Upload CSV
POST   /api/v1/ingest/upload           Upload with tracking
POST   /api/v1/ingest/event            Single event
GET    /api/v1/ingest/status/{id}      Job status
GET    /api/v1/data-quality/{id}       Quality metrics
GET    /api/v1/health                  Health check
```

### ML Engine (Port 8001)
```
POST   /predict/logistics              Logistics prediction
POST   /predict/factory                Factory prediction
POST   /predict/warehouse              Warehouse prediction
POST   /predict/delivery               Delivery prediction
POST   /forecast/7d                    7-day forecast
```

### RAG Chatbot (Port 4000)
```
POST   /api/upload                     Upload PDF
GET    /api/upload/:id/status          Upload status
POST   /api/query                      Ask questions
POST   /api/rag/recommend              Generate recommendations ⭐
GET    /api/recommendations            Get recommendations
PATCH  /api/recommendations/:id        Update status
GET    /health                         Health check
```

### Orchestration Engine (Port 8000) - TO BUILD
```
GET    /emissions/current              Current emissions
GET    /emissions/forecast             7-day forecast
GET    /hotspots                       Top hotspots
GET    /recommendations                Open recommendations
POST   /recommendations/:id/approve    Approve action
POST   /simulate                       What-if scenario
GET    /data-quality                   Data completeness
WS     /ws                             WebSocket channels
```

---

## 🌐 WebSocket Channels

```
┌─────────────────────────────────────────────────────────────┐
│                    WEBSOCKET CHANNELS                        │
├─────────────────────────────────────────────────────────────┤
│ emissions           │ Live emission rate updates            │
│ hotspots            │ New/removed hotspots                  │
│ alerts              │ Alert notifications                   │
│ recommendations     │ New recommendations                   │
│ ingest_jobs         │ Upload progress (Data Core)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Services

### RAG Chatbot (Isolated)
```
┌─────────────────────────────────────────────────────────────┐
│ Qdrant              │ Port 6334 (isolated from other proj) │
│ Redis               │ Port 6380 (optional caching)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Integration Status

```
┌──────────────────┬──────────┬────────┬─────────────────────┐
│ Component        │ Status   │ Port   │ Owner               │
├──────────────────┼──────────┼────────┼─────────────────────┤
│ Data Core        │ ✅ Done  │ 8002   │ You (This session)  │
│ RAG Chatbot      │ ✅ Done  │ 4000   │ You (This session)  │
│ ML Engine        │ 🔄 Built │ 8001   │ Teammate 1          │
│ Frontend         │ 🔄 Built │ 3000   │ Teammate 2          │
│ Orchestration    │ ⏳ Next  │ 8000   │ Next session        │
└──────────────────┴──────────┴────────┴─────────────────────┘
```

---

## 📦 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND STACK                           │
├─────────────────────────────────────────────────────────────┤
│ Data Core          │ Python, FastAPI, Pandas, Scikit-learn │
│ ML Engine          │ Python, FastAPI, XGBoost, PyTorch     │
│ Orchestration      │ Python, FastAPI, httpx, APScheduler   │
│ RAG Chatbot        │ Node.js, TypeScript, LangChain        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND STACK                          │
├─────────────────────────────────────────────────────────────┤
│ Framework          │ React 18 + TypeScript                 │
│ Build              │ Vite                                   │
│ Styling            │ TailwindCSS + ShadCN UI               │
│ Charts             │ Recharts                               │
│ Maps               │ Mapbox / React-Map-GL                 │
│ Animations         │ Framer Motion                          │
│ State              │ React Query + Context                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATA STACK                              │
├─────────────────────────────────────────────────────────────┤
│ Database           │ Supabase (PostgreSQL)                 │
│ Vector DB          │ Qdrant                                 │
│ AI/ML              │ Gemini 2.0 Flash, Scikit-learn        │
│ Embeddings         │ all-MiniLM-L6-v2                      │
│ Caching            │ Redis (optional)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps Checklist

### Orchestration Engine Development:

- [ ] Set up project structure
- [ ] Configure Supabase connection
- [ ] Create database tables (hotspots, alerts, baselines, etc.)
- [ ] Implement ML Engine client
- [ ] Implement RAG client
- [ ] Build hotspot detection logic
- [ ] Create REST API endpoints
- [ ] Set up WebSocket server
- [ ] Implement scheduler (APScheduler)
- [ ] Add error handling & logging
- [ ] Write tests
- [ ] Create documentation

### Integration:

- [ ] Test Data Core → Orchestration
- [ ] Test ML Engine → Orchestration
- [ ] Test RAG → Orchestration
- [ ] Test Orchestration → Frontend
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Demo preparation

---

**Ready for next session!** 🚀
