# Carbon Nexus Integration Guide

This document describes the extensions made to the RAG Chatbot Plugin for Carbon Nexus integration.

## 🎯 What Changed

### 1. Database Migration: MySQL → Supabase

**Why:** Carbon Nexus uses Supabase as the primary database for all plugins.

**Changes:**
- Replaced `mysql2` with `@supabase/supabase-js`
- Updated `src/config/database.ts` to use Supabase client
- Updated environment variables in `.env` and `.env.example`

**New Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 2. New Feature: Structured Recommendations

**Why:** The Orchestration Engine needs structured, machine-readable recommendations (not just text) to:
- Display in frontend UI cards
- Store in database
- Trigger WebSocket events
- Enable What-if simulations

**New Endpoint:** `POST /api/rag/recommend`

This endpoint generates structured JSON recommendations for carbon emission hotspots.

---

## 📊 New Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  hotspot_id BIGINT,
  supplier_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  co2_reduction FLOAT,
  cost_impact TEXT,
  feasibility INT CHECK (feasibility >= 0 AND feasibility <= 10),
  confidence FLOAT,
  root_cause TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','implemented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_hotspot ON recommendations(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_supplier ON recommendations(supplier_id);

-- Update existing tables for Supabase compatibility
CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  student_id BIGINT NOT NULL,
  class_id INT NOT NULL,
  qdrant_collection TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_student ON uploads(student_id);
CREATE INDEX IF NOT EXISTS idx_uploads_class ON uploads(class_id);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id BIGSERIAL PRIMARY KEY,
  upload_id BIGINT NOT NULL REFERENCES uploads(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  processed_at TIMESTAMPTZ,
  chunks_count INT DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_upload ON ingestion_jobs(upload_id);
```

---

## 🔌 New API Endpoints

### 1. Generate Recommendations

**Endpoint:** `POST /api/rag/recommend`

**Purpose:** Generate structured recommendations for a carbon emission hotspot.

**Request Body:**
```json
{
  "supplier": "Supplier A",
  "predicted": 120,
  "baseline": 60,
  "hotspot_reason": "High load + diesel fleet",
  "event_type": "logistics",
  "hotspot_id": 123,
  "save_to_db": true
}
```

**Response:**
```json
{
  "root_cause": "Higher order volumes increased load on diesel fleet",
  "actions": [
    {
      "title": "Shift 20% load to Supplier B",
      "description": "Redistribute load to reduce emissions",
      "co2_reduction": 22.5,
      "cost_impact": "+3%",
      "feasibility": 9,
      "confidence": 0.87
    },
    {
      "title": "Switch diesel fleet to CNG",
      "description": "Convert 50% of fleet to CNG vehicles",
      "co2_reduction": 15.2,
      "cost_impact": "-1%",
      "feasibility": 7,
      "confidence": 0.82
    }
  ],
  "saved": 2,
  "recommendations": [...]
}
```

**Fields Explained:**
- `title`: Short actionable title (max 60 chars)
- `description`: Brief explanation (max 200 chars)
- `co2_reduction`: Estimated CO₂ reduction in kg
- `cost_impact`: Cost impact as percentage ("+3%", "-2%", "0%")
- `feasibility`: Score from 1-10 (10 = most feasible)
- `confidence`: AI confidence score (0-1)

---

### 2. Get Recommendations

**Endpoint:** `GET /api/recommendations`

**Query Parameters:**
- `status`: Filter by status (pending|approved|rejected|implemented)
- `supplier_id`: Filter by supplier
- `limit`: Max results (default 50)

**Response:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "hotspot_id": 123,
      "supplier_id": "S-1",
      "title": "Shift 20% load to Supplier B",
      "co2_reduction": 22.5,
      "cost_impact": "+3%",
      "feasibility": 9,
      "status": "pending",
      "created_at": "2025-11-28T12:00:00Z"
    }
  ]
}
```

---

### 3. Update Recommendation Status

**Endpoint:** `PATCH /api/recommendations/:id`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "recommendation": {
    "id": 1,
    "status": "approved",
    "updated_at": "2025-11-28T12:30:00Z"
  }
}
```

---

## 🔄 Integration with Orchestration Engine

The Orchestration Engine will call the RAG plugin like this:

```typescript
// When hotspot is detected
const hotspotContext = {
  supplier: "Supplier A",
  predicted: 120,
  baseline: 60,
  hotspot_reason: "High load + diesel fleet",
  hotspot_id: 123
};

// Call RAG plugin
const response = await fetch('http://rag-service:4000/api/rag/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(hotspotContext)
});

const recommendations = await response.json();

// Recommendations are now stored in Supabase
// Orchestration can push to WebSocket: 'new_recommendation' event
```

---

## 🧪 Testing the New Endpoint

### Test Script (PowerShell)

```powershell
# Test recommendation generation
$body = @{
    supplier = "Supplier A"
    predicted = 120
    baseline = 60
    hotspot_reason = "High load + diesel fleet"
    save_to_db = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/rag/recommend" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test Script (curl)

```bash
curl -X POST http://localhost:4000/api/rag/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "supplier": "Supplier A",
    "predicted": 120,
    "baseline": 60,
    "hotspot_reason": "High load + diesel fleet",
    "save_to_db": true
  }'
```

---

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install the new `@supabase/supabase-js` package.

### 2. Update Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Create Database Tables

Run the SQL from the "New Database Tables" section above in your Supabase SQL Editor.

### 4. Start the Service

```bash
npm run dev
```

The service will start on port 4000.

---

## 🎯 Key Differences from Original RAG Plugin

| Feature | Original (ERP) | Carbon Nexus |
|---------|---------------|--------------|
| Database | MySQL | Supabase |
| Primary Use | Student PDF Q&A | Hotspot Recommendations |
| Output Format | Text answers | Structured JSON |
| Integration | Standalone | Orchestration Engine |
| New Endpoint | None | `/api/rag/recommend` |
| New Table | None | `recommendations` |

---

## 🔐 Security Notes

- Use `SUPABASE_SERVICE_KEY` for backend operations (bypasses RLS)
- Never expose service key to frontend
- Recommendations table can use Row Level Security if needed
- Consider adding authentication middleware for production

---

## 🚀 Next Steps

1. **Deploy RAG Plugin** with Supabase configuration
2. **Test `/api/rag/recommend`** endpoint
3. **Integrate with Orchestration Engine**
4. **Connect to Frontend** for recommendation cards
5. **Set up WebSocket** for real-time recommendation push

---

## 📝 Summary

✅ Migrated from MySQL to Supabase  
✅ Added structured recommendation generation  
✅ Created `/api/rag/recommend` endpoint  
✅ Added `recommendations` table  
✅ Integrated with Gemini for AI-powered insights  
✅ Ready for Orchestration Engine integration  

The RAG plugin is now fully compatible with Carbon Nexus architecture!
