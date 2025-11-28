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