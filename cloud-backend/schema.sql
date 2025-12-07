-- NextGen Cloud API - Production Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for API key management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'free', -- free, pro, team
    rate_limit INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_api_key ON users(api_key);

-- Errors table
CREATE TABLE errors (
    id VARCHAR(64) PRIMARY KEY,
    signature VARCHAR(64) NOT NULL,
    framework VARCHAR(50),
    first_seen TIMESTAMP DEFAULT NOW(),
    occurrence_count INT DEFAULT 1,
    last_seen TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_errors_signature ON errors(signature);
CREATE INDEX idx_errors_framework ON errors(framework);

-- Fixes table
CREATE TABLE fixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_id VARCHAR(64) REFERENCES errors(id) ON DELETE CASCADE,
    fix_signature VARCHAR(64) NOT NULL,
    fix_data JSONB NOT NULL,
    success_count INT DEFAULT 0,
    fail_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fixes_error ON fixes(error_id);
CREATE INDEX idx_fixes_success_rate ON fixes((success_count::float / NULLIF(success_count + fail_count, 0)));

-- Learnings table (raw telemetry data)
CREATE TABLE learnings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    error_signature VARCHAR(64) NOT NULL,
    fix_signature VARCHAR(64) NOT NULL,
    success BOOLEAN NOT NULL,
    duration_ms INT,
    project_size INT,
    framework VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learnings_user ON learnings(user_id);
CREATE INDEX idx_learnings_error ON learnings(error_signature);
CREATE INDEX idx_learnings_created ON learnings(created_at DESC);

-- Analytics table (aggregated stats)
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_errors INT DEFAULT 0,
    total_fixes INT DEFAULT 0,
    success_rate FLOAT DEFAULT 0,
    active_users INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_analytics_date ON analytics(date);

-- Functions

-- Update error occurrence count
CREATE OR REPLACE FUNCTION update_error_occurrence()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE errors 
    SET occurrence_count = occurrence_count + 1,
        last_seen = NOW()
    WHERE id = NEW.error_signature;
    
    IF NOT FOUND THEN
        INSERT INTO errors (id, signature, framework, occurrence_count)
        VALUES (NEW.error_signature, NEW.error_signature, NEW.framework, 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_error_occurrence
AFTER INSERT ON learnings
FOR EACH ROW
EXECUTE FUNCTION update_error_occurrence();

-- Update fix success/fail counts
CREATE OR REPLACE FUNCTION update_fix_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.success THEN
        UPDATE fixes 
        SET success_count = success_count + 1,
            updated_at = NOW()
        WHERE fix_signature = NEW.fix_signature;
    ELSE
        UPDATE fixes 
        SET fail_count = fail_count + 1,
            updated_at = NOW()
        WHERE fix_signature = NEW.fix_signature;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fix_counts
AFTER INSERT ON learnings
FOR EACH ROW
EXECUTE FUNCTION update_fix_counts();

-- Views

-- Top patterns view
CREATE VIEW top_patterns AS
SELECT 
    e.signature as error_signature,
    e.framework,
    f.fix_signature,
    f.fix_data,
    f.success_count,
    f.fail_count,
    (f.success_count::float / NULLIF(f.success_count + f.fail_count, 0)) as success_rate,
    (f.success_count + f.fail_count) as usage_count
FROM fixes f
JOIN errors e ON f.error_id = e.id
WHERE (f.success_count + f.fail_count) > 10
ORDER BY success_rate DESC, usage_count DESC;

-- User contribution stats
CREATE VIEW user_stats AS
SELECT 
    user_id,
    COUNT(*) as total_contributions,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_fixes,
    COUNT(DISTINCT error_signature) as unique_errors,
    MIN(created_at) as joined_at
FROM learnings
GROUP BY user_id;

-- Seed data for testing
INSERT INTO users (email, api_key, tier) VALUES
('test@example.com', 'ngb_test_abc123', 'pro');

COMMENT ON TABLE errors IS 'Stores unique error signatures';
COMMENT ON TABLE fixes IS 'Stores fix recipes and their success rates';
COMMENT ON TABLE learnings IS 'Raw telemetry data from users';
COMMENT ON TABLE analytics IS 'Daily aggregated statistics';
