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

-- NEW: Recommendations table (for Carbon Nexus)
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