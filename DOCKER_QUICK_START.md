# Docker Quick Start

## 🚀 Start All Services

```bash
# Option 1: Use the startup script
./docker-start.sh

# Option 2: Manual command
docker-compose up --build -d
```

## 🛑 Stop All Services

```bash
# Option 1: Use the stop script
./docker-stop.sh

# Option 2: Manual command
docker-compose down
```

## 📊 Check Status

```bash
docker-compose ps
```

## 📝 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f orchestration-engine
```

## 🔄 Restart Service

```bash
docker-compose restart [service-name]
```

## 🌐 Service URLs

| Service | URL |
|---------|-----|
| ML Engine | http://localhost:8001 |
| Data Core | http://localhost:8002 |
| Orchestration | http://localhost:8003 |
| RAG Chatbot | http://localhost:8004 |
| Frontend UI | http://localhost:5173 |

## 🔌 WebSocket Endpoints

- `ws://localhost:8003/ws/hotspots`
- `ws://localhost:8003/ws/alerts`
- `ws://localhost:8003/ws/recommendations`

## ✅ Health Checks

```bash
curl http://localhost:8001/health  # ML Engine
curl http://localhost:8002/health  # Data Core
curl http://localhost:8003/health  # Orchestration
curl http://localhost:8004/api/health  # RAG Chatbot
```

## 🐛 Troubleshooting

### Service won't start
```bash
docker-compose logs [service-name]
```

### Rebuild service
```bash
docker-compose up -d --build [service-name]
```

### Clean restart
```bash
docker-compose down
docker-compose up --build
```

## 📖 Full Documentation

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete documentation.
