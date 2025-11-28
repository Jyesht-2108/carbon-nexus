# Orchestration Engine - Quick Start Guide

Get the Orchestration Engine running in 5 minutes!

## Prerequisites

- Python 3.11+
- Supabase account
- Data Core running (port 8002)
- RAG Chatbot running (port 4000)
- ML Engine running (port 8001) - optional for testing

## Step 1: Install Dependencies

```bash
cd plugins/orchestration-engine
pip install -r requirements.txt
```

## Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://azpbgjfsnmepzxofxitu.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
ML_ENGINE_URL=http://localhost:8001
DATA_CORE_URL=http://localhost:8002
RAG_SERVICE_URL=http://localhost:4000
API_PORT=8000
```

## Step 3: Create Database Tables

1. Open Supabase SQL Editor
2. Copy contents of `sql/schema.sql`
3. Run the SQL script

This creates:
- `hotspots` table
- `alerts` table
- `baselines` table
- `predictions` table
- `audit_logs` table

## Step 4: Start the Service

```bash
python -m src.main
```

You should see:

```
Starting Orchestration Engine...
ML Engine URL: http://localhost:8001
Data Core URL: http://localhost:8002
RAG Service URL: http://localhost:4000
Scheduler started
INFO:     Uvicorn running on http://0.0.0.0:8003
```

## Step 5: Test the Service

### Health Check

```bash
curl http://localhost:8003/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "orchestration-engine",
  "version": "1.0.0"
}
```

### Get Current Emissions

```bash
curl http://localhost:8000/emissions/current
```

### Trigger Hotspot Scan

```bash
curl -X POST http://localhost:8000/hotspots/scan
```

### View API Documentation

Open in browser:
```
http://localhost:8000/docs
```

## Common Issues

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Supabase Connection Error

- Verify `SUPABASE_URL` is correct
- Use service role key, not anon key
- Check network connectivity

### ML Engine Not Available

The orchestration engine will work without ML Engine, but predictions will fail. For testing, you can:
- Mock ML responses
- Use dummy data
- Start ML Engine service

## Next Steps

1. **Upload Data** - Use Data Core to upload CSV
2. **Monitor Hotspots** - Check `/hotspots` endpoint
3. **View Recommendations** - Check `/recommendations` endpoint
4. **Test Simulation** - Use `/simulate` endpoint

## Integration Testing

### Full Flow Test

1. Upload data via Data Core:
```bash
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@sample_data.csv"
```

2. Trigger hotspot scan:
```bash
curl -X POST http://localhost:8000/hotspots/scan
```

3. Check for hotspots:
```bash
curl http://localhost:8000/hotspots
```

4. View recommendations:
```bash
curl http://localhost:8000/recommendations/pending
```

## Scheduler

The orchestration engine runs scheduled tasks:

- **Hotspot Scan** - Every 5 minutes
- **Baseline Recalculation** - Every 1 hour

Configure intervals in `.env`:
```env
HOTSPOT_CHECK_INTERVAL=300
BASELINE_RECALC_INTERVAL=3600
```

## Logs

Logs are written to:
- Console (stdout)
- `logs/orchestration_YYYY-MM-DD.log`

View logs:
```bash
tail -f logs/orchestration_*.log
```

## Production Deployment

### Using Docker

```bash
docker build -t carbon-nexus-orchestration .
docker run -p 8000:8000 --env-file .env carbon-nexus-orchestration
```

### Environment Variables

For production, set:
```env
LOG_LEVEL=WARNING
API_HOST=0.0.0.0
```

## Support

- Full docs: `README.md`
- Architecture: `doc/orchestration_engine_architecture.md`
- Session context: `SESSION_SUMMARY.md`

---

**You're ready!** 🚀

The Orchestration Engine is now running and ready to detect hotspots and generate recommendations.
