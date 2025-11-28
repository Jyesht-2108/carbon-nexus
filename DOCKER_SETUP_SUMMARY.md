# Docker Setup Summary

## ✅ What Was Created

### 1. Main Docker Compose File
**File**: `docker-compose.yml` (root directory)

Orchestrates all 5 services:
- ✅ ML Engine (Port 8001)
- ✅ Data Core (Port 8002)
- ✅ Orchestration Engine (Port 8003)
- ✅ RAG Chatbot (Port 8004)
- ✅ Frontend UI (Port 5173)

**Features**:
- Shared `carbon_network` bridge network
- Health checks for all backend services
- Proper dependency ordering
- Auto-restart (`unless-stopped`)
- Environment variable injection from `.env` files
- Service-to-service communication via container names

### 2. RAG Chatbot Dockerfile
**File**: `rag_chatbot_plugin/Dockerfile` (NEW)

Node.js-based Dockerfile for the RAG chatbot service:
- Uses Node 18 Alpine
- Builds TypeScript to JavaScript
- Exposes port 8004
- Runs with `npm start`

### 3. Documentation Files

#### DOCKER_DEPLOYMENT.md
Comprehensive deployment guide covering:
- Architecture overview
- Service descriptions
- Prerequisites
- Quick start instructions
- Troubleshooting
- Production considerations
- Monitoring and cleanup

#### DOCKER_QUICK_START.md
Quick reference card with:
- Essential commands
- Service URLs
- Health check commands
- Common troubleshooting steps

### 4. Helper Scripts

#### docker-start.sh
Automated startup script that:
- Checks Docker is running
- Verifies .env files exist
- Builds and starts all services
- Shows service status and URLs

#### docker-stop.sh
Automated stop script that:
- Stops all services gracefully
- Shows cleanup options

## 🎯 Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  carbon_network                          │
│                                                           │
│  ML Engine (8001)                                        │
│       ↓                                                  │
│  Data Core (8002)                                        │
│       ↓                                                  │
│  Orchestration Engine (8003) ←→ RAG Chatbot (8004)     │
│       ↓                                                  │
│  Frontend UI (5173)                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🚀 How to Use

### First Time Setup

1. **Ensure .env files exist**:
   ```bash
   ls plugins/ml-engine/.env
   ls plugins/data-core/.env
   ls plugins/orchestration-engine/.env
   ls rag_chatbot_plugin/.env
   ls frontend-ui/.env
   ```

2. **Start all services**:
   ```bash
   ./docker-start.sh
   # or
   docker-compose up --build -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

4. **Check health**:
   ```bash
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   curl http://localhost:8003/health
   curl http://localhost:8004/api/health
   ```

5. **Access frontend**:
   Open http://localhost:5173 in your browser

### Daily Usage

**Start services**:
```bash
docker-compose up -d
```

**View logs**:
```bash
docker-compose logs -f
```

**Stop services**:
```bash
docker-compose down
```

## 📋 Service Dependencies

```
ML Engine (no dependencies)
    ↓
Data Core (depends on: ml-engine)
    ↓
Orchestration Engine (depends on: ml-engine, data-core)
    ↓
RAG Chatbot (depends on: orchestration-engine)
    ↓
Frontend UI (depends on: orchestration-engine, rag-chatbot)
```

## 🔧 Configuration

### Environment Variables

Each service uses its own `.env` file:

**ML Engine** (`plugins/ml-engine/.env`):
- Model configurations
- API settings

**Data Core** (`plugins/data-core/.env`):
- Database credentials
- ML Engine URL

**Orchestration Engine** (`plugins/orchestration-engine/.env`):
- Service URLs (overridden in docker-compose.yml)
- Supabase credentials
- Scheduler intervals

**RAG Chatbot** (`rag_chatbot_plugin/.env`):
- LLM API keys
- Vector database settings
- Orchestration URL

**Frontend UI** (`frontend-ui/.env`):
- API URLs (overridden in docker-compose.yml)
- WebSocket URLs

### Docker Compose Overrides

The `docker-compose.yml` overrides some environment variables to use container names:

```yaml
environment:
  - ML_ENGINE_URL=http://ml-engine:8001
  - DATA_CORE_URL=http://data-core:8002
  - RAG_SERVICE_URL=http://rag-chatbot:8004
```

This enables service-to-service communication within the Docker network.

## 🏥 Health Checks

All backend services have health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:[port]/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Services wait for dependencies to be healthy before starting.

## 🌐 Network Configuration

**Network Name**: `carbon_network`
**Driver**: bridge

All services are on the same network and can communicate using container names:
- `ml-engine:8001`
- `data-core:8002`
- `orchestration-engine:8003`
- `rag-chatbot:8004`

## 🔄 Restart Policy

All services use `restart: unless-stopped`:
- Automatically restart if they crash
- Don't restart if manually stopped
- Restart on Docker daemon restart

## 📊 Monitoring

### View all service status:
```bash
docker-compose ps
```

### View resource usage:
```bash
docker stats
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f orchestration-engine

# Last 100 lines
docker-compose logs --tail=100
```

## 🐛 Common Issues

### Port Already in Use
**Solution**: Change host port in `docker-compose.yml`:
```yaml
ports:
  - "9001:8001"  # Use 9001 instead of 8001
```

### Service Won't Start
**Solution**: Check logs:
```bash
docker-compose logs [service-name]
```

### Network Issues
**Solution**: Recreate network:
```bash
docker-compose down
docker network rm carbon_network
docker-compose up
```

### Build Failures
**Solution**: Clean rebuild:
```bash
docker-compose down --rmi all
docker-compose build --no-cache
docker-compose up
```

## 🧹 Cleanup

### Stop services:
```bash
docker-compose down
```

### Stop and remove volumes:
```bash
docker-compose down -v
```

### Stop and remove images:
```bash
docker-compose down --rmi all
```

### Full cleanup:
```bash
docker-compose down --rmi all -v
docker system prune -a
```

## ✅ Verification Checklist

- [ ] Docker is installed and running
- [ ] Docker Compose is installed
- [ ] All `.env` files exist
- [ ] `docker-compose.yml` is in root directory
- [ ] All Dockerfiles exist in service directories
- [ ] Run `docker-compose up --build -d`
- [ ] Check `docker-compose ps` shows all services healthy
- [ ] Verify health endpoints respond
- [ ] Access frontend at http://localhost:5173
- [ ] Test WebSocket connections

## 🎉 Success Criteria

When everything is working:
1. ✅ All 5 services show "Up (healthy)" status
2. ✅ Health endpoints return 200 OK
3. ✅ Frontend loads in browser
4. ✅ WebSocket connections establish
5. ✅ Services can communicate with each other

## 📚 Additional Resources

- **Full Documentation**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Quick Reference**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
- **WebSocket Guide**: [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md)
- **Integration Testing**: [INTEGRATION_TESTING_GUIDE.md](INTEGRATION_TESTING_GUIDE.md)

## 🚀 Next Steps

1. Start services: `./docker-start.sh`
2. Verify health: Check all health endpoints
3. Access UI: Open http://localhost:5173
4. Test features: Upload data, view hotspots, check recommendations
5. Monitor logs: `docker-compose logs -f`

---

**Ready to deploy!** 🎯
