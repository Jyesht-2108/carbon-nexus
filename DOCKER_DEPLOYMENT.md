# Docker Deployment Guide

## Overview
This guide explains how to run the entire Carbon Nexus platform using Docker Compose.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     carbon_network (Docker Network)          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ML Engine   │  │  Data Core   │  │Orchestration │      │
│  │  Port: 8001  │◄─┤  Port: 8002  │◄─┤  Port: 8003  │      │
│  └──────────────┘  └──────────────┘  └───────┬──────┘      │
│                                               │              │
│  ┌──────────────┐                            │              │
│  │ RAG Chatbot  │◄───────────────────────────┘              │
│  │  Port: 8004  │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│  ┌──────▼───────┐                                           │
│  │ Frontend UI  │                                           │
│  │  Port: 5173  │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Services

### 1. ML Engine (Port 8001)
- **Purpose**: Machine learning models for emission predictions
- **Dependencies**: None (base service)
- **Health Check**: `http://localhost:8001/health`

### 2. Data Core (Port 8002)
- **Purpose**: Data ingestion, normalization, and storage
- **Dependencies**: ML Engine
- **Health Check**: `http://localhost:8002/health`

### 3. Orchestration Engine (Port 8003)
- **Purpose**: Central coordination, hotspot detection, WebSocket hub
- **Dependencies**: ML Engine, Data Core
- **Health Check**: `http://localhost:8003/health`
- **WebSocket Endpoints**:
  - `ws://localhost:8003/ws/hotspots`
  - `ws://localhost:8003/ws/alerts`
  - `ws://localhost:8003/ws/recommendations`

### 4. RAG Chatbot (Port 8004)
- **Purpose**: AI-powered recommendations using RAG
- **Dependencies**: Orchestration Engine
- **Health Check**: `http://localhost:8004/api/health`

### 5. Frontend UI (Port 5173)
- **Purpose**: React-based user interface
- **Dependencies**: Orchestration Engine, RAG Chatbot
- **Access**: `http://localhost:5173`

## Prerequisites

1. **Docker** (version 20.10+)
   ```bash
   docker --version
   ```

2. **Docker Compose** (version 2.0+)
   ```bash
   docker-compose --version
   ```

3. **Environment Files**
   Ensure `.env` files exist in each service directory:
   - `plugins/ml-engine/.env`
   - `plugins/data-core/.env`
   - `plugins/orchestration-engine/.env`
   - `rag_chatbot_plugin/.env`
   - `frontend-ui/.env`

## Quick Start

### 1. Build and Start All Services

```bash
# From the root directory
docker-compose up --build
```

This will:
- Build Docker images for all 5 services
- Start services in dependency order
- Create the `carbon_network` bridge network
- Enable health checks and auto-restart

### 2. Start in Detached Mode (Background)

```bash
docker-compose up -d --build
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ml-engine
docker-compose logs -f orchestration-engine
docker-compose logs -f frontend-ui
```

### 4. Check Service Status

```bash
docker-compose ps
```

Expected output:
```
NAME                          STATUS              PORTS
carbon-nexus-ml-engine        Up (healthy)        0.0.0.0:8001->8001/tcp
carbon-nexus-data-core        Up (healthy)        0.0.0.0:8002->8002/tcp
carbon-nexus-orchestration    Up (healthy)        0.0.0.0:8003->8003/tcp
carbon-nexus-rag-chatbot      Up (healthy)        0.0.0.0:8004->8004/tcp
carbon-nexus-frontend         Up                  0.0.0.0:5173->5173/tcp
```

### 5. Stop All Services

```bash
docker-compose down
```

### 6. Stop and Remove Volumes

```bash
docker-compose down -v
```

## Service URLs

Once running, access services at:

| Service | URL | Description |
|---------|-----|-------------|
| ML Engine | http://localhost:8001 | ML predictions API |
| Data Core | http://localhost:8002 | Data ingestion API |
| Orchestration | http://localhost:8003 | Central coordination API |
| RAG Chatbot | http://localhost:8004 | Recommendations API |
| Frontend UI | http://localhost:5173 | Web interface |

## Health Checks

Verify all services are healthy:

```bash
# ML Engine
curl http://localhost:8001/health

# Data Core
curl http://localhost:8002/health

# Orchestration Engine
curl http://localhost:8003/health

# RAG Chatbot
curl http://localhost:8004/api/health
```

## Troubleshooting

### Service Won't Start

1. **Check logs**:
   ```bash
   docker-compose logs [service-name]
   ```

2. **Check health status**:
   ```bash
   docker-compose ps
   ```

3. **Restart specific service**:
   ```bash
   docker-compose restart [service-name]
   ```

### Port Conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "9001:8001"  # Change host port (left side)
```

### Network Issues

1. **Recreate network**:
   ```bash
   docker-compose down
   docker network rm carbon_network
   docker-compose up
   ```

2. **Check network**:
   ```bash
   docker network inspect carbon_network
   ```

### Build Issues

1. **Clean rebuild**:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. **Remove old images**:
   ```bash
   docker-compose down --rmi all
   docker-compose up --build
   ```

### Environment Variables Not Loading

1. **Verify .env files exist**:
   ```bash
   ls -la plugins/*/. env rag_chatbot_plugin/.env frontend-ui/.env
   ```

2. **Check .env format** (no spaces around `=`):
   ```bash
   SUPABASE_URL=https://example.supabase.co
   SUPABASE_KEY=your-key-here
   ```

## Development Workflow

### Rebuild Single Service

```bash
docker-compose up -d --build ml-engine
```

### View Real-time Logs

```bash
docker-compose logs -f orchestration-engine
```

### Execute Commands in Container

```bash
# Access container shell
docker-compose exec orchestration-engine sh

# Run Python command
docker-compose exec ml-engine python -c "print('Hello')"
```

### Restart Service After Code Changes

```bash
docker-compose restart orchestration-engine
```

## Production Considerations

### 1. Environment Variables

Use `.env` files or Docker secrets for sensitive data:

```yaml
services:
  orchestration-engine:
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
```

### 2. Resource Limits

Add resource constraints:

```yaml
services:
  ml-engine:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### 3. Volumes for Persistence

Add volumes for data persistence:

```yaml
services:
  ml-engine:
    volumes:
      - ml-models:/app/models
      - ml-data:/app/data

volumes:
  ml-models:
  ml-data:
```

### 4. Logging

Configure logging drivers:

```yaml
services:
  orchestration-engine:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. Security

- Use non-root users in Dockerfiles
- Scan images for vulnerabilities
- Use secrets management
- Enable TLS/SSL for production

## Monitoring

### Check Resource Usage

```bash
docker stats
```

### Inspect Container

```bash
docker-compose exec orchestration-engine env
```

### Network Connectivity Test

```bash
# From orchestration-engine, ping ml-engine
docker-compose exec orchestration-engine ping ml-engine
```

## Cleanup

### Remove Everything

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes
docker-compose down -v

# Also remove images
docker-compose down --rmi all -v
```

### Prune Docker System

```bash
# Remove unused containers, networks, images
docker system prune -a
```

## Next Steps

1. **Configure Environment Variables**: Update all `.env` files with your credentials
2. **Start Services**: Run `docker-compose up --build`
3. **Verify Health**: Check all health endpoints
4. **Access Frontend**: Open http://localhost:5173
5. **Test Integration**: Use the test scripts in the repository

## Support

For issues or questions:
1. Check service logs: `docker-compose logs [service]`
2. Verify health checks: `curl http://localhost:[port]/health`
3. Review this documentation
4. Check individual service README files
