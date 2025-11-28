# Docker Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Host Machine                                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              carbon_network (Docker Bridge)                  │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  ML Engine Container                                  │  │   │
│  │  │  - Image: carbon-nexus-ml-engine                     │  │   │
│  │  │  - Port: 8001:8001                                   │  │   │
│  │  │  - Health: /health                                   │  │   │
│  │  │  - Restart: unless-stopped                           │  │   │
│  │  └────────────────────┬─────────────────────────────────┘  │   │
│  │                       │                                     │   │
│  │  ┌────────────────────▼─────────────────────────────────┐  │   │
│  │  │  Data Core Container                                  │  │   │
│  │  │  - Image: carbon-nexus-data-core                     │  │   │
│  │  │  - Port: 8002:8002                                   │  │   │
│  │  │  - Health: /health                                   │  │   │
│  │  │  - Depends: ml-engine (healthy)                      │  │   │
│  │  │  - Restart: unless-stopped                           │  │   │
│  │  └────────────────────┬─────────────────────────────────┘  │   │
│  │                       │                                     │   │
│  │  ┌────────────────────▼─────────────────────────────────┐  │   │
│  │  │  Orchestration Engine Container                       │  │   │
│  │  │  - Image: carbon-nexus-orchestration                 │  │   │
│  │  │  - Port: 8003:8003                                   │  │   │
│  │  │  - Health: /health                                   │  │   │
│  │  │  - WebSocket: /ws/hotspots, /ws/alerts, /ws/recs    │  │   │
│  │  │  - Depends: ml-engine, data-core (healthy)           │  │   │
│  │  │  - Restart: unless-stopped                           │  │   │
│  │  └────────────────────┬─────────────────────────────────┘  │   │
│  │                       │                                     │   │
│  │  ┌────────────────────▼─────────────────────────────────┐  │   │
│  │  │  RAG Chatbot Container                                │  │   │
│  │  │  - Image: carbon-nexus-rag-chatbot                   │  │   │
│  │  │  - Port: 8004:8004                                   │  │   │
│  │  │  - Health: /api/health                               │  │   │
│  │  │  - Depends: orchestration-engine (healthy)           │  │   │
│  │  │  - Restart: unless-stopped                           │  │   │
│  │  └────────────────────┬─────────────────────────────────┘  │   │
│  │                       │                                     │   │
│  │  ┌────────────────────▼─────────────────────────────────┐  │   │
│  │  │  Frontend UI Container                                │  │   │
│  │  │  - Image: carbon-nexus-frontend                      │  │   │
│  │  │  - Port: 5173:5173                                   │  │   │
│  │  │  - Depends: orchestration-engine, rag-chatbot        │  │   │
│  │  │  - Restart: unless-stopped                           │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Port Mappings (Host → Container):                                  │
│  • 8001 → ml-engine:8001                                            │
│  • 8002 → data-core:8002                                            │
│  • 8003 → orchestration-engine:8003                                 │
│  • 8004 → rag-chatbot:8004                                          │
│  • 5173 → frontend-ui:5173                                          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Service Communication Flow

### 1. Data Ingestion Flow
```
External Data
    ↓
Data Core (8002)
    ↓
ML Engine (8001) ← Prediction Request
    ↓
Data Core ← Prediction Result
    ↓
Orchestration Engine (8003) ← Event Notification
```

### 2. Hotspot Detection Flow
```
Orchestration Engine (8003)
    ↓
Scheduler triggers hotspot scan
    ↓
Hotspot Engine queries Data Core (8002)
    ↓
ML Engine (8001) ← Prediction Request
    ↓
Hotspot detected
    ↓
WebSocket Broadcast → Frontend (5173)
    ↓
Alert generated
    ↓
RAG Chatbot (8004) ← Recommendation Request
    ↓
Recommendations generated
    ↓
WebSocket Broadcast → Frontend (5173)
```

### 3. Frontend User Flow
```
User Browser
    ↓
Frontend UI (5173)
    ↓
HTTP API Calls → Orchestration Engine (8003)
    ↓
WebSocket Connection → Orchestration Engine (8003)
    ↓
Real-time Updates ← WebSocket Messages
```

## Network Configuration

### Bridge Network: carbon_network

**Purpose**: Isolate Carbon Nexus services from other Docker containers

**Features**:
- Service discovery via container names
- Internal DNS resolution
- Network isolation
- Port mapping to host

**Service Names (DNS)**:
- `ml-engine` → resolves to ML Engine container IP
- `data-core` → resolves to Data Core container IP
- `orchestration-engine` → resolves to Orchestration container IP
- `rag-chatbot` → resolves to RAG Chatbot container IP
- `frontend-ui` → resolves to Frontend container IP

### Inter-Service Communication

Services communicate using container names:

```yaml
# Orchestration Engine environment
ML_ENGINE_URL=http://ml-engine:8001
DATA_CORE_URL=http://data-core:8002
RAG_SERVICE_URL=http://rag-chatbot:8004
```

## Health Check System

### Health Check Flow

```
Docker Daemon
    ↓
Every 30 seconds
    ↓
Execute: curl -f http://localhost:[port]/health
    ↓
Success (200 OK) → Service marked "healthy"
Failure → Retry (max 3 times)
    ↓
After 3 failures → Service marked "unhealthy"
```

### Dependency Chain

```
ML Engine starts
    ↓ (waits for healthy)
Data Core starts
    ↓ (waits for healthy)
Orchestration Engine starts
    ↓ (waits for healthy)
RAG Chatbot starts
    ↓ (waits for healthy)
Frontend UI starts
```

### Start Period

Each service has a 40-second start period:
- Health checks don't count as failures during this time
- Allows services to initialize before health checks matter

## Volume Mounts (Optional)

### For Development

```yaml
services:
  ml-engine:
    volumes:
      - ./plugins/ml-engine/src:/app/src:ro  # Read-only source
      - ml-models:/app/models                 # Persistent models
```

### For Production

```yaml
volumes:
  ml-models:
    driver: local
  ml-data:
    driver: local
  orchestration-logs:
    driver: local
```

## Environment Variable Injection

### From .env Files

```yaml
services:
  orchestration-engine:
    env_file:
      - ./plugins/orchestration-engine/.env
```

Loads all variables from the .env file into the container.

### Direct Environment Variables

```yaml
services:
  orchestration-engine:
    environment:
      - ML_ENGINE_URL=http://ml-engine:8001
      - DATA_CORE_URL=http://data-core:8002
```

Overrides .env file values for Docker-specific configuration.

## Build Context

### Service Build Configuration

```yaml
services:
  ml-engine:
    build:
      context: ./plugins/ml-engine  # Build context directory
      dockerfile: Dockerfile         # Dockerfile location
```

**Build Process**:
1. Docker reads `./plugins/ml-engine/Dockerfile`
2. Build context is `./plugins/ml-engine/`
3. All paths in Dockerfile are relative to context
4. Image is tagged as `carbon-nexus-ml-engine`

## Restart Policies

### unless-stopped

```yaml
restart: unless-stopped
```

**Behavior**:
- ✅ Restart if container crashes
- ✅ Restart on Docker daemon restart
- ❌ Don't restart if manually stopped with `docker stop`

**Use Case**: Production stability during demos

### Alternative Policies

```yaml
restart: always        # Always restart, even if manually stopped
restart: on-failure    # Only restart on error exit codes
restart: no            # Never restart automatically
```

## Port Mapping

### Format

```yaml
ports:
  - "HOST_PORT:CONTAINER_PORT"
```

### Examples

```yaml
ports:
  - "8001:8001"  # Host 8001 → Container 8001
  - "9001:8001"  # Host 9001 → Container 8001 (custom host port)
```

### Access Patterns

**From Host**:
```bash
curl http://localhost:8001/health
```

**From Another Container**:
```bash
curl http://ml-engine:8001/health
```

## Resource Limits (Optional)

### CPU and Memory Limits

```yaml
services:
  ml-engine:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Max 2 CPU cores
          memory: 4G       # Max 4GB RAM
        reservations:
          cpus: '1.0'      # Guaranteed 1 CPU core
          memory: 2G       # Guaranteed 2GB RAM
```

## Logging Configuration

### Default Logging

```yaml
services:
  orchestration-engine:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"    # Max 10MB per log file
        max-file: "3"      # Keep 3 log files
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f orchestration-engine

# Last 100 lines
docker-compose logs --tail=100 orchestration-engine
```

## Security Considerations

### Network Isolation

- Services only accessible via exposed ports
- Internal communication on private network
- No direct access to containers from outside

### Environment Variables

- Sensitive data in .env files (not committed to git)
- .env files loaded at runtime
- Use Docker secrets for production

### User Permissions

Dockerfiles should use non-root users:

```dockerfile
RUN adduser -D appuser
USER appuser
```

## Scaling (Future)

### Horizontal Scaling

```bash
docker-compose up --scale ml-engine=3
```

Requires:
- Load balancer
- Stateless services
- Shared storage for models

### Orchestration Platforms

For production scaling:
- Kubernetes
- Docker Swarm
- AWS ECS
- Google Cloud Run

## Monitoring Stack (Optional)

### Add Monitoring Services

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - carbon_network

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    networks:
      - carbon_network
```

## Backup and Recovery

### Backup Volumes

```bash
docker run --rm \
  -v carbon_nexus_ml-models:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/ml-models-backup.tar.gz /data
```

### Restore Volumes

```bash
docker run --rm \
  -v carbon_nexus_ml-models:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/ml-models-backup.tar.gz -C /
```

## Development vs Production

### Development

```yaml
# docker-compose.dev.yml
services:
  ml-engine:
    build:
      target: development
    volumes:
      - ./plugins/ml-engine/src:/app/src
    environment:
      - DEBUG=true
```

### Production

```yaml
# docker-compose.prod.yml
services:
  ml-engine:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## Summary

The Docker Compose setup provides:
- ✅ Single-command deployment
- ✅ Service orchestration with dependencies
- ✅ Health monitoring
- ✅ Automatic restarts
- ✅ Network isolation
- ✅ Environment configuration
- ✅ Scalability foundation
- ✅ Production-ready architecture
