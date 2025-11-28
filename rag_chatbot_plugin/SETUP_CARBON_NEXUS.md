# Carbon Nexus RAG Plugin - Complete Setup Guide

## 🎯 Overview

This guide will help you set up the RAG Chatbot Plugin for Carbon Nexus integration in **under 10 minutes**.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- Gemini API key (free tier works)
- Qdrant running (Docker or cloud)

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
cd rag_chatbot_plugin
npm install
```

This installs:
- `@supabase/supabase-js` (database)
- `@langchain/google-genai` (AI)
- `@qdrant/js-client-rest` (vector DB)
- All other dependencies

---

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=4000

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Gemini (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Qdrant (REQUIRED)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=carbon_nexus_docs

# Embedding Service (REQUIRED)
EMBEDDING_URL=http://localhost:8000/embed
```

**Where to get credentials:**

1. **Supabase:**
   - Go to https://supabase.com
   - Create project (free)
   - Settings → API → Copy URL and service_role key

2. **Gemini:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key (free)

3. **Qdrant:**
   - Run locally: `docker run -p 6333:6333 qdrant/qdrant`
   - Or use Qdrant Cloud (free tier)

---

### Step 3: Create Database Tables

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Recommendations table (NEW for Carbon Nexus)
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

CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_hotspot ON recommendations(hotspot_id);
CREATE INDEX idx_recommendations_supplier ON recommendations(supplier_id);

-- Uploads table (for document management)
CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  student_id BIGINT NOT NULL,
  class_id INT NOT NULL,
  qdrant_collection TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploads_student ON uploads(student_id);
CREATE INDEX idx_uploads_class ON uploads(class_id);

-- Ingestion jobs table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id BIGSERIAL PRIMARY KEY,
  upload_id BIGINT NOT NULL REFERENCES uploads(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  processed_at TIMESTAMPTZ,
  chunks_count INT DEFAULT 0,
  error_message TEXT
);

CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_upload ON ingestion_jobs(upload_id);
```

---

### Step 4: Start Embedding Server

The embedding server must run separately:

```bash
# In a new terminal
python embedding_server.py
```

This starts on port 8000 and provides text embeddings.

---

### Step 5: Start RAG Service

```bash
npm run dev
```

Service starts on port 4000.

---

## ✅ Verify Installation

### Test 1: Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-28T12:00:00.000Z"
}
```

### Test 2: Generate Recommendations

```bash
curl -X POST http://localhost:4000/api/rag/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "supplier": "Supplier A",
    "predicted": 120,
    "baseline": 60,
    "hotspot_reason": "High load + diesel fleet"
  }'
```

Expected response:
```json
{
  "root_cause": "Higher order volumes increased load",
  "actions": [
    {
      "title": "Shift 20% load to Supplier B",
      "co2_reduction": 22.5,
      "cost_impact": "+3%",
      "feasibility": 9,
      "confidence": 0.87
    }
  ],
  "saved": 1
}
```

### Test 3: Run Test Script

```powershell
# Windows PowerShell
./test-recommend.ps1
```

```bash
# Linux/Mac
chmod +x test-recommend.ps1
./test-recommend.ps1
```

---

## 🔧 Troubleshooting

### Issue 1: "Cannot connect to Supabase"

**Solution:**
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_KEY` (not anon key)
- Test connection in Supabase dashboard

### Issue 2: "Gemini API error"

**Solution:**
- Verify `GEMINI_API_KEY` is valid
- Check API quota at https://makersuite.google.com
- Try model: `gemini-2.0-flash-exp` (faster, free)

### Issue 3: "Qdrant connection failed"

**Solution:**
```bash
# Start Qdrant with Docker
docker run -p 6333:6333 qdrant/qdrant
```

### Issue 4: "Embedding service not found"

**Solution:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start embedding server
python embedding_server.py
```

### Issue 5: "Table does not exist"

**Solution:**
- Run the SQL from Step 3 in Supabase SQL Editor
- Verify tables exist in Supabase dashboard

---

## 🎯 Integration with Orchestration Engine

Once the RAG service is running, the Orchestration Engine can call it:

```typescript
// In Orchestration Engine
const response = await fetch('http://localhost:4000/api/rag/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplier: hotspot.supplier,
    predicted: hotspot.predicted,
    baseline: hotspot.baseline,
    hotspot_reason: hotspot.reason,
    hotspot_id: hotspot.id,
    save_to_db: true
  })
});

const recommendations = await response.json();

// Push to WebSocket
websocket.emit('new_recommendation', recommendations);
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/api/rag/recommend` | Generate recommendations |
| GET | `/api/recommendations` | Get all recommendations |
| PATCH | `/api/recommendations/:id` | Update recommendation status |
| POST | `/api/upload` | Upload documents (original feature) |
| POST | `/api/query` | Query documents (original feature) |

---

## 🐳 Docker Deployment (Optional)

### Build Image

```bash
docker build -t carbon-nexus-rag .
```

### Run Container

```bash
docker run -p 4000:4000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_SERVICE_KEY=your-key \
  -e GEMINI_API_KEY=your-key \
  carbon-nexus-rag
```

---

## 📈 Performance Tips

1. **Use Gemini Flash** for faster responses:
   ```env
   GEMINI_MODEL=gemini-2.0-flash-exp
   ```

2. **Enable Redis caching** (optional):
   ```env
   REDIS_ENABLED=true
   REDIS_URL=redis://localhost:6379
   ```

3. **Adjust batch sizes** for embeddings:
   ```env
   EMBEDDING_BATCH_SIZE=64
   ```

---

## 🔐 Production Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use environment-specific configs
- [ ] Enable logging and monitoring
- [ ] Set up backups in Supabase
- [ ] Configure rate limiting
- [ ] Add authentication middleware

---

## 📚 Documentation

- `CARBON_NEXUS_INTEGRATION.md` - Full integration guide
- `MIGRATION_GUIDE.md` - MySQL to Supabase migration
- `CARBON_NEXUS_SUMMARY.md` - Feature summary
- `README.md` - Original documentation

---

## 🎉 Success!

If all tests pass, your RAG plugin is ready for Carbon Nexus integration!

**Next Steps:**
1. Deploy to production
2. Integrate with Orchestration Engine
3. Connect to Frontend
4. Set up monitoring

---

## 💬 Support

For issues:
- Check logs in console
- Review Supabase logs
- Test each service independently
- Verify all environment variables

**Common Commands:**
```bash
# Check service status
curl http://localhost:4000/health

# View logs
npm run dev

# Restart service
Ctrl+C then npm run dev

# Test recommendations
./test-recommend.ps1
```

Setup complete! 🚀
