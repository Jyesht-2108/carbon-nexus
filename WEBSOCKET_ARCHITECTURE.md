# WebSocket Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WebSocket Service (websocket.ts)             │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Hotspots   │  │    Alerts    │  │Recommendations│  │  │
│  │  │  Connection  │  │  Connection  │  │  Connection   │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │  │
│  └─────────┼──────────────────┼──────────────────┼───────────┘  │
│            │                  │                  │               │
└────────────┼──────────────────┼──────────────────┼───────────────┘
             │                  │                  │
             │ WebSocket        │ WebSocket        │ WebSocket
             │                  │                  │
┌────────────┼──────────────────┼──────────────────┼───────────────┐
│            ▼                  ▼                  ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Orchestration Engine (FastAPI)                   │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │/ws/hotspots  │  │  /ws/alerts  │  │/ws/recommend │  │   │
│  │  │   Endpoint   │  │   Endpoint   │  │   Endpoint   │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │   │
│  │         │                  │                  │           │   │
│  │         └──────────────────┴──────────────────┘           │   │
│  │                            │                              │   │
│  │                  ┌─────────▼─────────┐                   │   │
│  │                  │  Connection Lists  │                   │   │
│  │                  │  - hotspot_conns   │                   │   │
│  │                  │  - alert_conns     │                   │   │
│  │                  │  - recommend_conns │                   │   │
│  │                  └─────────┬─────────┘                   │   │
│  │                            │                              │   │
│  │                  ┌─────────▼─────────┐                   │   │
│  │                  │ WebSocket         │                   │   │
│  │                  │ Broadcaster       │                   │   │
│  │                  │ (broadcaster.py)  │                   │   │
│  │                  └─────────┬─────────┘                   │   │
│  │                            │                              │   │
│  │         ┌──────────────────┼──────────────────┐          │   │
│  │         │                  │                  │          │   │
│  │    ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐  │   │
│  │    │ Hotspot │      │   Alert     │   │Recommendation│  │   │
│  │    │ Engine  │      │   Routes    │   │   Routes     │  │   │
│  │    └────┬────┘      └──────┬──────┘   └──────┬───────┘  │   │
│  │         │                  │                  │          │   │
│  └─────────┼──────────────────┼──────────────────┼──────────┘   │
│            │                  │                  │              │
│            └──────────────────┴──────────────────┘              │
│                               │                                 │
│                      ┌────────▼────────┐                        │
│                      │  Supabase DB    │                        │
│                      │  - hotspots     │                        │
│                      │  - alerts       │                        │
│                      │  - recommendations                       │
│                      └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. Hotspot Detection Flow

```
Event Ingested
    │
    ▼
Hotspot Engine
    │
    ├─► Insert to DB (hotspots table)
    │
    ├─► broadcast_hotspot() ──► WebSocket ──► Frontend
    │
    ├─► Generate Alert
    │   │
    │   ├─► Insert to DB (alerts table)
    │   │
    │   └─► broadcast_alert() ──► WebSocket ──► Frontend
    │
    └─► Generate Recommendations (via RAG)
        │
        ├─► Insert to DB (recommendations table)
        │
        └─► broadcast_recommendation() ──► WebSocket ──► Frontend
```

### 2. Recommendation Status Update Flow

```
User Action (Approve/Reject)
    │
    ▼
Recommendation Routes
    │
    ├─► Update DB (recommendations table)
    │
    └─► broadcast_recommendation() ──► WebSocket ──► Frontend
```

## Component Responsibilities

### Frontend (websocket.ts)
- Establish WebSocket connections to all 3 endpoints
- Parse incoming JSON messages
- Distribute messages to subscribed components
- Handle reconnection on disconnect

### Orchestration Engine (main.py)
- Accept WebSocket connections
- Maintain connection lists
- Handle connection lifecycle (connect/disconnect)

### Broadcaster (websocket_broadcaster.py)
- Serialize data to JSON
- Send to all connected clients
- Handle disconnected clients
- Log broadcast events

### Business Logic
- **Hotspot Engine**: Detect anomalies, broadcast hotspots
- **Alert Routes**: Create alerts, broadcast alerts
- **Recommendation Routes**: Manage recommendations, broadcast updates

## Message Flow Example

```
1. Hotspot Detected
   ↓
2. hotspot_engine.py calls:
   await broadcast_hotspot({
     "id": 123,
     "entity": "Supplier A",
     "severity": "warn",
     ...
   })
   ↓
3. websocket_broadcaster.py:
   - Converts to JSON
   - Sends to all clients in hotspot_connections list
   ↓
4. Frontend websocket.ts:
   - Receives message
   - Parses JSON
   - Calls all subscribers: callback(data)
   ↓
5. React Component:
   - Updates state
   - Triggers re-render
   - Shows notification
```

## Connection Management

### Backend
```python
# Connection lists (in-memory)
hotspot_connections: List[WebSocket] = []
alert_connections: List[WebSocket] = []
recommendation_connections: List[WebSocket] = []

# On connect: append to list
# On disconnect: remove from list
# On broadcast: iterate and send to all
```

### Frontend
```typescript
// Connection map
connections: Map<string, WebSocket> = new Map();

// On connect: store in map
// On disconnect: remove from map, schedule reconnect
// On message: parse and notify subscribers
```

## Scalability Considerations

### Current Implementation (Single Server)
- In-memory connection lists
- Works for single orchestration instance
- Connections lost on server restart

### Future Enhancements (Multi-Server)
- Use Redis Pub/Sub for message distribution
- Sticky sessions or connection pooling
- Persistent connection state
- Load balancer with WebSocket support

## Security Notes

### Current
- No authentication on WebSocket connections
- Open to any client that can reach the endpoint

### Recommended for Production
- Add JWT token authentication
- Validate token on WebSocket connect
- Rate limiting per connection
- CORS configuration
- WSS (WebSocket Secure) with TLS
