# Data Core Plugin Architecture (data-core)

This document defines the complete architecture for the **Carbon Nexus Data Core Plugin**.  
This plugin is intentionally designed to be **the simplest backend plugin**, perfect for a team member who wants clear, limited responsibilities.

It focuses only on:
- Data ingestion
- Data normalization
- Data validation
- Outlier detection
- Data completeness calculation
- Basic gap-filling using a simple regression model
- Writing cleaned data into Supabase

The plugin must remain **self-contained**, easy to test, and easy to integrate later.

---

# 1. Purpose of the Data Core Plugin

This plugin forms the **data backbone** of Carbon Nexus.
It ensures all incoming supply-chain events are:
- Valid
- Clean
- Normalized
- Consistent
- Stored properly

Before ML or analytics run, data-core makes sure data is usable.

### Core Responsibilities
1. **Ingest raw events** (from demo-scripts or MCP orchestrator)
2. **Normalize raw data** into consistent formats
3. **Detect missing fields** and mark them
4. **Detect anomalies/outliers**
5. **Perform basic ML-powered gap-filling**
6. **Compute data-quality metrics**
7. **Write results to Supabase** tables:
   - events_raw
   - events_normalized
   - data_quality

No business logic.  
No ML prediction.  
No alerts.  
No reasoning.  
Just data.

---

# 2. Technologies Used

| Layer | Library |
|-------|---------|
| API | FastAPI |
| Data Processing | Pandas, NumPy |
| Regression Gap-filling | Scikit-learn (Linear Regression) |
| Outlier Detection | IQR / DBSCAN (optional) |
| DB Communication | PostgREST or Supabase Python SDK |
| Logging | Loguru |

---

# 3. Folder Structure

```
plugins/data-core/
  ├── src/
  │   ├── api/
  │   │   └── routes.py
  │   ├── ingestion/
  │   │   ├── csv_ingest.py
  │   │   ├── stream_ingest.py
  │   │   └── schema_validator.py
  │   ├── processing/
  │   │   ├── normalizer.py
  │   │   ├── outlier_detector.py
  │   │   ├── gap_filler.py
  │   │   └── quality_metrics.py
  │   ├── db/
  │   │   ├── supabase_client.py
  │   │   └── write_ops.py
  │   ├── utils/
  │   │   ├── logger.py
  │   │   └── constants.py
  │   ├── app.py
  ├── requirements.txt
  └── Dockerfile
```

This structure is simple, modular, and easy for a single developer.

---

# 4. Data Flow Overview

```
RAW DATA → Validation → Normalization → Outlier Detection → Gap Filling → DB Insert → Data Quality Metrics
```

Everything flows linearly.
No dependencies on other plugins.

---

# 5. Ingestion Layer

### **5.1 CSV Ingestion** (`POST /ingest/csv`)
- Parse CSV using pandas
- Validate schema
- Convert to normalized event objects
- Trigger processing pipeline

### **5.2 Stream Ingestion** (`POST /ingest/event`)
- Single event ingestion
- ISO timestamp check
- Basic type validation

### **5.3 Validation Rules**
Schema validator checks:
- Required fields exist
- Types are valid (int, float, string)
- Timestamp is valid
- Supplier ID exists

On failure → log + return error

---

# 6. Processing Layer

## 6.1 Normalization (`normalizer.py`)
Converts all fields into unified format.
Ensures consistent:
- Units (km, kg, kWh)
- Vehicle fuel encodings
- Temperature units
- Optional fields set to null

Example normalization:
```
vehicle_type: "2W" → "two_wheeler"
temperature: "20C" → 20
```

---

## 6.2 Outlier Detection (`outlier_detector.py`)
Simple, fast methods:

### Method 1: IQR
- Identify points outside 1.5× IQR
- Mark `is_outlier = True`

### Method 2: Optional DBSCAN
- For time-series or volume-based anomalies

Outliers are not removed, only flagged.

---

## 6.3 Gap Filling (`gap_filler.py`)
Simple regression model:
- Load `gap_filler_model.pkl`
- Predict missing numeric values
- Return confidence score (0–1)

Example output:
```json
{
  "value": 52.1,
  "confidence": 0.87,
  "method": "linear_regression"
}
```

Gap-filling only applies to:
- distance_km
- energy_kwh
- load_kg
- route_length

Other fields are left null.

---

## 6.4 Data Quality Metrics (`quality_metrics.py`)
Compute per-ingestion window:

- `real_percentage` — % original data
- `predicted_percentage` — gap-filled
- `missing_fields_count`
- `outlier_count`
- Produce final JSON:

```json
{
  "supplier_id": "S-19",
  "window_start": "2025-11-28T12:00:00Z",
  "completeness_pct": 82,
  "predicted_pct": 18,
  "anomalies": 3
}
```

---

# 7. Database Operations

### Supabase Tables Written:
- **events_raw**
- **events_normalized**
- **data_quality**

### DB Client (supabase_client.py)
Uses service role key with Row Level Security disabled for backend operations.

Two main operations:
- `insert_raw_event()`
- `insert_normalized_event()`
- `insert_quality_metrics()`

---

# 8. API Endpoints

All endpoints served by FastAPI.

## **8.1 `POST /ingest/csv`**
Input:
```
file: CSV
```

Output:
```json
{ "status": "ok", "rows": 150 }
```

## **8.2 `POST /ingest/event`**
Input:
```json
{
  "supplier_id": "S-2",
  "distance_km": 12,
  "vehicle_type": "mini_truck"
}
```
Output:
```json
{ "status": "stored" }
```

## **8.3 `GET /data-quality/{supplier}`**
Returns latest completeness metrics.

---

# 9. Logging

Every step logs:
- Timestamp
- Event ID
- Outlier flagged
- Gap-filled fields
- DB insertion status

Using Loguru for easy formatting.

---

# 10. Deliverables

### Minimum
- Working ingestion endpoints
- Normalization pipeline
- Outlier detection
- Gap filler
- Data quality calculation
- Supabase integration
- Dockerfile

### Optional
- Bulk ingestion
- Historical backfill scripts

---

# 11. Summary

The **data-core plugin** is lightweight and essential.  
It prepares clean, complete data for ML, hotspot detection, forecasting, and reasoning.  
It is perfect for independent implementation and merges cleanly into the full system.

---

When ready, you can request:
- "Generate data-core folder skeleton"
- "Generate CSV ingestion API code"
- "Create normalization pipeline code"

