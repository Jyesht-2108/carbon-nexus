# Data Core - Quick Start Guide

## Prerequisites

- Python 3.11+
- Supabase account with project created
- pip or poetry for package management

## Setup Steps

### 1. Install Dependencies

```bash
cd plugins/data-core
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 3. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Events Raw Table
CREATE TABLE events_raw (
    id BIGSERIAL PRIMARY KEY,
    supplier_id TEXT,
    timestamp TIMESTAMPTZ,
    payload JSONB,
    data_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Normalized Table
CREATE TABLE events_normalized (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT,
    supplier_id TEXT,
    distance_km FLOAT,
    load_kg FLOAT,
    vehicle_type TEXT,
    fuel_type TEXT,
    speed FLOAT,
    timestamp TIMESTAMPTZ,
    is_outlier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Quality Table
CREATE TABLE data_quality (
    id BIGSERIAL PRIMARY KEY,
    supplier_id TEXT,
    window_start TIMESTAMPTZ,
    completeness_pct FLOAT,
    predicted_pct FLOAT,
    anomalies_count INTEGER,
    total_rows INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingest Jobs Table
CREATE TABLE ingest_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id TEXT UNIQUE,
    status TEXT,
    filename TEXT,
    rows_total INTEGER,
    rows_processed INTEGER,
    errors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_events_raw_supplier ON events_raw(supplier_id);
CREATE INDEX idx_events_raw_timestamp ON events_raw(timestamp);
CREATE INDEX idx_events_normalized_supplier ON events_normalized(supplier_id);
CREATE INDEX idx_events_normalized_timestamp ON events_normalized(timestamp);
CREATE INDEX idx_ingest_jobs_job_id ON ingest_jobs(job_id);
```

### 4. Run the Service

```bash
# Run directly
python -m src.main

# Or with uvicorn (recommended for development)
uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

The service will start on `http://localhost:8002`

### 5. Test the API

```bash
# Test health check
curl http://localhost:8002/api/v1/health

# Run test script
python scripts/test_upload.py
```

## Docker Setup (Alternative)

```bash
# Build and run with Docker
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Testing with Sample Data

### Upload CSV File

```bash
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@sample_data.csv"
```

### Send Single Event

```bash
curl -X POST http://localhost:8002/api/v1/ingest/event \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-28T12:00:00Z",
    "supplier_id": "S-1",
    "event_type": "logistics",
    "distance_km": 120,
    "load_kg": 450,
    "vehicle_type": "truck",
    "fuel_type": "diesel"
  }'
```

### Upload with Job Tracking

```bash
curl -X POST http://localhost:8002/api/v1/ingest/upload \
  -F "file=@sample_data.csv"
```

Response will include a `jobId`. Check status:

```bash
curl http://localhost:8002/api/v1/ingest/status/{jobId}
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

## Troubleshooting

### Connection Error
- Check if Supabase URL and key are correct
- Verify network connectivity to Supabase

### Import Errors
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.11+)

### Port Already in Use
- Change port in `.env`: `API_PORT=8003`
- Or kill process using port 8002

### Database Errors
- Verify tables are created in Supabase
- Check service role key has proper permissions

## Next Steps

1. **Integrate with ML Engine**: ML Engine will consume `events_normalized` table
2. **Connect Orchestration Engine**: Will trigger on new data inserts
3. **Frontend Integration**: Frontend will call upload endpoints

## Development Tips

- Use `--reload` flag for auto-restart during development
- Check logs in `logs/` directory
- Use sample_data.csv for quick testing
- Monitor Supabase dashboard for data flow

## Support

For issues or questions, check:
- README.md for detailed architecture
- Architecture docs in `/doc` folder
- API documentation at `/docs` endpoint
