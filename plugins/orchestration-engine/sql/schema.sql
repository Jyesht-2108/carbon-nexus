-- Orchestration Engine Database Schema
-- Tables for hotspots, alerts, baselines, predictions, and audit logs

-- Hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
    id BIGSERIAL PRIMARY KEY,
    entity TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('supplier', 'route', 'factory', 'warehouse')),
    predicted_co2 FLOAT NOT NULL,
    baseline_co2 FLOAT NOT NULL,
    percent_above FLOAT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
    event_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT hotspots_entity_idx UNIQUE (entity, entity_type, created_at)
);

CREATE INDEX idx_hotspots_status ON hotspots(status);
CREATE INDEX idx_hotspots_severity ON hotspots(severity);
CREATE INDEX idx_hotspots_entity ON hotspots(entity, entity_type);
CREATE INDEX idx_hotspots_created_at ON hotspots(created_at DESC);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'critical')),
    message TEXT NOT NULL,
    hotspot_id BIGINT REFERENCES hotspots(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_level ON alerts(level);
CREATE INDEX idx_alerts_hotspot_id ON alerts(hotspot_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- Baselines table
CREATE TABLE IF NOT EXISTS baselines (
    id BIGSERIAL PRIMARY KEY,
    entity TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('supplier', 'route', 'factory', 'warehouse')),
    baseline_value FLOAT NOT NULL,
    calculation_method TEXT DEFAULT 'historical_average',
    sample_size INT,
    confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT baselines_entity_unique UNIQUE (entity, entity_type)
);

CREATE INDEX idx_baselines_entity ON baselines(entity, entity_type);
CREATE INDEX idx_baselines_updated_at ON baselines(updated_at DESC);

-- Predictions table (cache for ML predictions)
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('logistics', 'factory', 'warehouse', 'delivery')),
    predicted_co2 FLOAT NOT NULL,
    confidence_score FLOAT,
    model_version TEXT,
    features JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_event_id ON predictions(event_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id BIGINT NOT NULL,
    user_id TEXT,
    notes TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Comments
COMMENT ON TABLE hotspots IS 'Detected emission hotspots with severity levels';
COMMENT ON TABLE alerts IS 'Generated alerts for hotspots and anomalies';
COMMENT ON TABLE baselines IS 'Baseline emission values for entities';
COMMENT ON TABLE predictions IS 'Cached ML predictions for events';
COMMENT ON TABLE audit_logs IS 'Audit trail for all actions';

-- Sample data for testing
-- INSERT INTO baselines (entity, entity_type, baseline_value, sample_size) VALUES
-- ('Supplier A', 'supplier', 60.0, 100),
-- ('Supplier B', 'supplier', 45.0, 100),
-- ('Route R1', 'route', 80.0, 50);
