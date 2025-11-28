# Carbon Nexus - Data Core Plugin

The Data Core plugin is responsible for data ingestion, validation, normalization, outlier detection, gap-filling, and data quality management.

## Features

- **CSV/XLSX Upload**: Accept file uploads from frontend
- **Schema Validation**: Validate incoming data against expected schema
- **Data Normalization**: Standardize vehicle types, fuel types, units
- **Outlier Detection**: Flag anomalies using IQR or Z-score methods
- **Gap Filling**: ML-powered missing value imputation
- **Quality Metrics**: Calculate data completeness and quality scores
- **Job Tracking**: Track upload progress with status updates

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
```

## Configuration

Edit `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
API_PORT=8002
```

## Running Locally

```bash
# Run directly
python -m src.main

# Or with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

## Running with Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d
```

## API Endpoints

### POST /api/v1/ingest/csv
Upload and process CSV file

**Request:**
- Content-Type: multipart/form-data
- Body: file (CSV)

**Response:**
```json
{
  "status": "ok",
  "rows": 150,
  "outliers": 5,
  "quality_metrics": {...}
}
```

### POST /api/v1/ingest/event
Ingest single event

**Request:**
```json
{
  "timestamp": "2025-11-28T12:00:00Z",
  "supplier_id": "S-123",
  "event_type": "logistics",
  "distance_km": 120,
  "load_kg": 450,
  "vehicle_type": "truck",
  "fuel_type": "diesel"
}
```

### POST /api/v1/ingest/upload
Upload file with job tracking (CSV/XLSX)

**Response:**
```json
{
  "jobId": "uuid-here",
  "message": "Upload received and processed",
  "rows": 200
}
```

### GET /api/v1/ingest/status/{job_id}
Get upload job status

**Response:**
```json
{
  "job_id": "uuid",
  "status": "complete",
  "rows_total": 200,
  "rows_processed": 200,
  "errors": []
}
```

### GET /api/v1/data-quality/{supplier_id}
Get data quality metrics for supplier

### GET /api/v1/health
Health check endpoint

## Architecture

```
Raw Data → Validation → Normalization → Outlier Detection → Gap Filling → DB Insert → Quality Metrics
```

## Database Tables

The plugin writes to these Supabase tables:

- **events_raw**: Raw ingested events
- **events_normalized**: Cleaned and normalized events
- **data_quality**: Quality metrics per supplier/window
- **ingest_jobs**: Upload job tracking

## Data Processing Pipeline

1. **Validation**: Check required fields, data types, timestamp format
2. **Normalization**: Standardize vehicle types, fuel types, units
3. **Outlier Detection**: Flag anomalies using IQR method
4. **Gap Filling**: Fill missing values using regression models
5. **Quality Calculation**: Compute completeness and prediction percentages
6. **Storage**: Insert into Supabase tables

## Testing

```bash
# Test CSV upload
curl -X POST http://localhost:8002/api/v1/ingest/csv \
  -F "file=@sample_data.csv"

# Test single event
curl -X POST http://localhost:8002/api/v1/ingest/event \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-28T12:00:00Z",
    "supplier_id": "S-1",
    "event_type": "logistics",
    "distance_km": 100,
    "vehicle_type": "truck"
  }'
```

## Development

The plugin is designed to be:
- **Self-contained**: No dependencies on other plugins
- **Easy to test**: Simple API endpoints
- **Easy to integrate**: Clean interfaces for orchestration engine

## Next Steps

After data-core is running:
1. ML Engine will consume normalized events for predictions
2. Orchestration Engine will trigger on new data inserts
3. Frontend will call upload endpoints and track job progress
