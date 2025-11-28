# Docker Setup for Carbon Nexus RAG Plugin

## 🎯 Overview

This Docker Compose setup creates **isolated services** for Carbon Nexus, separate from any other projects.

## 📦 Services Included

### 1. Qdrant (Vector Database)
- **Container:** `qdrant-carbon-nexus`
- **Port:** `6334` (different from default 6333)
- **Storage:** Separate volume `carbon_nexus_qdrant_storage`
- **Collection:** `carbon_nexus_docs`

### 2. Redis (Optional Caching)
- **Container:** `redis-carbon-nexus`
- **Port:** `6380` (different from default 6379)
- **Storage:** Separate volume `carbon_nexus_redis_data`

## 🚀 Quick Start

### Start Services

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

Your `.env` should have:

```env
# Qdrant (Carbon Nexus instance)
QDRANT_URL=http://localhost:6334
QDRANT_COLLECTION=carbon_nexus_docs

# Redis (optional)
REDIS_URL=redis://localhost:6380
REDIS_ENABLED=false
```

### Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Qdrant | 6333 | 6334 | Vector database |
| Redis | 6379 | 6380 | Caching (optional) |

**Why different ports?**
- Avoids conflicts with your other project's Qdrant (port 6333)
- Allows both projects to run simultaneously

## 📊 Data Isolation

### Separate Storage Volumes

```
carbon_nexus_qdrant_storage/  ← Carbon Nexus data
carbon_nexus_redis_data/      ← Carbon Nexus cache

(Your other project uses different volumes)
```

### Separate Collections

- **Carbon Nexus:** `carbon_nexus_docs`
- **Other Project:** `erp_notes`

Complete isolation - no data mixing!

## ✅ Verify Setup

### 1. Check Qdrant is Running

```bash
curl http://localhost:6334/
```

Expected response:
```json
{
  "title": "qdrant - vector search engine",
  "version": "1.x.x"
}
```

### 2. Check Collection

```bash
curl http://localhost:6334/collections/carbon_nexus_docs
```

### 3. Check Redis (if enabled)

```bash
redis-cli -p 6380 ping
```

Expected: `PONG`

## 🔄 Managing Data

### Backup Qdrant Data

```bash
# Create backup
docker run --rm -v carbon_nexus_qdrant_storage:/data -v $(pwd):/backup \
  alpine tar czf /backup/qdrant-backup.tar.gz -C /data .
```

### Restore Qdrant Data

```bash
# Restore from backup
docker run --rm -v carbon_nexus_qdrant_storage:/data -v $(pwd):/backup \
  alpine tar xzf /backup/qdrant-backup.tar.gz -C /data
```

### Clear All Data

```bash
# WARNING: This deletes everything!
docker-compose down -v
docker volume rm carbon_nexus_qdrant_storage carbon_nexus_redis_data
```

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:6334 failed: port is already allocated`

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :6334

# Change port in docker-compose.yml
ports:
  - "6335:6333"  # Use different port

# Update .env
QDRANT_URL=http://localhost:6335
```

### Container Won't Start

```bash
# Check logs
docker-compose logs qdrant-carbon-nexus

# Restart
docker-compose restart qdrant-carbon-nexus
```

### Data Not Persisting

```bash
# Check volumes exist
docker volume ls | grep carbon_nexus

# Inspect volume
docker volume inspect carbon_nexus_qdrant_storage
```

## 🔐 Security Notes

### Production Deployment

For production, add authentication:

```yaml
# docker-compose.yml
services:
  qdrant-carbon-nexus:
    environment:
      - QDRANT__SERVICE__API_KEY=your-secret-key
```

Then update `.env`:
```env
QDRANT_API_KEY=your-secret-key
```

## 📈 Performance Tips

### Increase Qdrant Memory

```yaml
# docker-compose.yml
services:
  qdrant-carbon-nexus:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

### Enable Redis Caching

```env
# .env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6380
```

## 🎯 Integration with RAG Service

The RAG service will automatically connect to these services using the environment variables:

```typescript
// Automatically uses QDRANT_URL from .env
const qdrantClient = new QdrantClient({
  url: config.qdrant.url  // http://localhost:6334
});
```

## 📝 Summary

✅ **Isolated Setup**
- Separate Qdrant instance (port 6334)
- Separate Redis instance (port 6380)
- Separate storage volumes
- No conflicts with other projects

✅ **Easy Management**
- Start: `docker-compose up -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`

✅ **Data Safety**
- Persistent volumes
- Easy backup/restore
- Clear separation from other projects

---

**Ready to use!** Just run `docker-compose up -d` and your isolated Carbon Nexus services will start.
