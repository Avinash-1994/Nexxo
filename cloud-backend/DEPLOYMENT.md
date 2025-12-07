# NextGen Cloud Backend - Deployment Guide

## Quick Start

### 1. Database Setup (Supabase)

```bash
# Create a new Supabase project at https://supabase.com
# Copy your project URL and anon key

# Run the schema
psql $DATABASE_URL < schema.sql
```

### 2. Environment Variables

Create `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
NODE_ENV=production
```

### 3. Local Development

```bash
cd cloud-backend
bun install
bun run dev
```

Server runs at `http://localhost:3000`

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

### 5. Deploy to Cloudflare Workers

```bash
# Install Wrangler
npm i -g wrangler

# Configure wrangler.toml
cat > wrangler.toml << EOF
name = "nextgen-api"
main = "server.ts"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://your-project.supabase.co"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
EOF

# Deploy
wrangler deploy
```

## API Testing

```bash
# Health check
curl https://api.nextgen.build/health

# Upload learnings
curl -X POST https://api.nextgen.build/api/v1/learnings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ngb_test_abc123" \
  -H "X-User-Id: anon-test123" \
  -d '{
    "userId": "anon-test123",
    "sessionId": "session-123",
    "learnings": [{
      "errorSignature": "abc123",
      "fixSignature": "def456",
      "success": true,
      "durationMs": 1500,
      "projectSize": 250,
      "framework": "react",
      "anonymized": true
    }]
  }'

# Download patterns
curl https://api.nextgen.build/api/v1/patterns?limit=10 \
  -H "Authorization: Bearer ngb_test_abc123" \
  -H "X-User-Id: anon-test123"
```

## Monitoring

### Supabase Dashboard
- View real-time database activity
- Monitor API usage
- Check error logs

### Vercel Analytics
- Request count
- Response times
- Error rates

### Custom Metrics
```sql
-- Daily active users
SELECT COUNT(DISTINCT user_id) 
FROM learnings 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Top errors
SELECT error_signature, COUNT(*) as count
FROM learnings
GROUP BY error_signature
ORDER BY count DESC
LIMIT 10;

-- Success rate by framework
SELECT framework, 
       AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate
FROM learnings
GROUP BY framework;
```

## Scaling

### Database
- Enable connection pooling (PgBouncer)
- Add read replicas for pattern downloads
- Partition `learnings` table by date

### API
- Enable Cloudflare CDN for `/api/v1/patterns`
- Cache patterns in Redis (5 min TTL)
- Use edge functions for low latency

### Cost Optimization
- Free tier: Supabase (500MB) + Vercel (100GB bandwidth)
- Pro tier: ~$25/month (Supabase Pro + Vercel Pro)
- Scale: ~$100/month (10M requests, 10GB DB)

## Security

### API Key Rotation
```sql
UPDATE users 
SET api_key = 'ngb_live_' || gen_random_uuid()
WHERE email = 'user@example.com';
```

### Rate Limiting
- 100 req/min for free tier
- 1000 req/min for pro tier
- Implemented via `hono-rate-limiter`

### CORS
- Allow all origins for public API
- Restrict admin endpoints to dashboard domain

## Backup & Recovery

```bash
# Automated backups (Supabase)
# - Daily snapshots (7 day retention)
# - Point-in-time recovery (Pro tier)

# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```
