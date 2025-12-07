# NextGen Cloud API - Backend Specification

## Overview
Production-ready REST API for the Self-Learning AI system. Handles anonymized telemetry, pattern distribution, and model synchronization.

## Base URL
- **Production**: `https://api.nextgen.build`
- **Staging**: `https://staging-api.nextgen.build`
- **Local Dev**: `http://localhost:3000`

## Authentication
All requests require:
```
Authorization: Bearer <API_KEY>
X-User-Id: <ANONYMOUS_USER_ID>
```

## Endpoints

### 1. Health Check
```
GET /health
Response: { "status": "ok", "version": "1.0.0" }
```

### 2. Upload Learnings
```
POST /api/v1/learnings
Content-Type: application/json

Body:
{
  "userId": "anon-abc123",
  "sessionId": "session-1234567890",
  "learnings": [
    {
      "errorSignature": "sha256...",
      "fixSignature": "sha256...",
      "success": true,
      "durationMs": 1500,
      "projectSize": 250,
      "framework": "react",
      "anonymized": true
    }
  ]
}

Response:
{
  "success": true,
  "newPatterns": 5,
  "improvedAccuracy": "+2.3%",
  "modelVersion": "v1.2.3"
}
```

### 3. Download Patterns
```
GET /api/v1/patterns?limit=10000
Authorization: Bearer <API_KEY>

Response:
{
  "patterns": [
    {
      "errorSignature": "sha256...",
      "fixSignature": "sha256...",
      "successRate": 0.95,
      "usageCount": 2341,
      "framework": "react",
      "fix": {
        "type": "SHELL_COMMAND",
        "description": "Install missing dependency",
        "command": "npm install lodash",
        "confidence": 0.95
      }
    }
  ],
  "total": 45623,
  "version": "v1.2.3"
}
```

### 4. Get User Stats
```
GET /api/v1/users/me/stats
Authorization: Bearer <API_KEY>

Response:
{
  "userId": "anon-abc123",
  "contributedPatterns": 156,
  "helpedUsers": 2341,
  "rank": "top-10%",
  "joined": "2024-01-15T00:00:00Z"
}
```

## Database Schema (Backend)

### `errors` table
```sql
CREATE TABLE errors (
  id VARCHAR(64) PRIMARY KEY,
  signature VARCHAR(64) NOT NULL,
  framework VARCHAR(50),
  first_seen TIMESTAMP DEFAULT NOW(),
  occurrence_count INT DEFAULT 1,
  INDEX idx_signature (signature)
);
```

### `fixes` table
```sql
CREATE TABLE fixes (
  id VARCHAR(64) PRIMARY KEY,
  error_id VARCHAR(64) REFERENCES errors(id),
  fix_signature VARCHAR(64) NOT NULL,
  fix_data JSON NOT NULL,
  success_count INT DEFAULT 0,
  fail_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_error (error_id),
  INDEX idx_success_rate ((success_count / (success_count + fail_count + 1)))
);
```

### `learnings` table
```sql
CREATE TABLE learnings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  error_signature VARCHAR(64) NOT NULL,
  fix_signature VARCHAR(64) NOT NULL,
  success BOOLEAN NOT NULL,
  duration_ms INT,
  project_size INT,
  framework VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user (user_id),
  INDEX idx_error (error_signature)
);
```

## Privacy & Security

### Data Anonymization
- ✅ All error messages are SHA256 hashed
- ✅ No source code or file contents transmitted
- ✅ No configuration values sent
- ✅ User IDs are anonymous (anon-xxx)
- ✅ IP addresses not logged

### Rate Limiting
- 100 requests/minute per user
- 1000 patterns download/day
- 10MB max request size

### API Key Management
```bash
# Generate API key
curl -X POST https://api.nextgen.build/api/v1/keys \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response
{
  "apiKey": "ngb_live_abc123...",
  "tier": "free",
  "rateLimit": 100
}
```

## Deployment

### Tech Stack
- **Runtime**: Node.js 20+ / Bun
- **Framework**: Hono / Fastify
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Hosting**: Vercel / Cloudflare Workers

### Environment Variables
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
RATE_LIMIT_REDIS_URL=...
```

## Monetization Tiers

### Free Tier
- 100 API calls/day
- Download up to 1,000 patterns
- Local learning only

### Pro Tier ($10/month)
- Unlimited API calls
- Download up to 50,000 patterns
- Priority sync
- Advanced analytics

### Team Tier ($25/user/month)
- Everything in Pro
- Team-shared patterns
- Private pattern library
- Dedicated support
