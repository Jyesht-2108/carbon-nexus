# WebSocket Integration Guide

## Overview
Real-time WebSocket connections between Orchestration Engine and Frontend for live updates of hotspots, alerts, and recommendations.

## Architecture

```
Frontend (React) <--WebSocket--> Orchestration Engine (FastAPI)
                                         |
                                         v
                                  Business Logic
                                  (Hotspot Engine, 
                                   Alert Routes,
                                   Recommendation Routes)
```

## Backend Implementation

### 1. WebSocket Endpoints (main.py)
Three WebSocket endpoints are available:
- `ws://localhost:8003/ws/hotspots` - Real-time hotspot updates
- `ws://localhost:8003/ws/alerts` - Real-time alert notifications
- `ws://localhost:8003/ws/recommendations` - Real-time recommendation updates

### 2. Broadcaster Service (websocket_broadcaster.py)
Centralized broadcasting functions:
- `broadcast_hotspot(data)` - Send hotspot to all connected clients
- `broadcast_alert(data)` - Send alert to all connected clients
- `broadcast_recommendation(data)` - Send recommendation to all connected clients

### 3. Integration Points

#### Hotspot Detection (hotspot_engine.py)
When a hotspot is detected:
```python
inserted_hotspot = await db_client.insert_hotspot(hotspot)
await broadcast_hotspot(inserted_hotspot)  # ← Broadcasts to WebSocket clients
```

#### Alert Generation (hotspot_engine.py)
When an alert is created:
```python
inserted_alert = await db_client.insert_alert(alert)
await broadcast_alert(inserted_alert)  # ← Broadcasts to WebSocket clients
```

#### Recommendation Creation (hotspot_engine.py)
When recommendations are generated:
```python
inserted = await db_client.insert_recommendation(recommendation)
await broadcast_recommendation(inserted)  # ← Broadcasts to WebSocket clients
```

#### Recommendation Status Updates (routes_recommendations.py)
When recommendations are approved/rejected:
```python
await broadcast_recommendation({
    "id": rec_id,
    "status": "approved",
    "action": "status_update"
})
```

## Frontend Implementation

### WebSocket Service (websocket.ts)
Connects to all three endpoints and manages:
- Automatic connection on startup
- Automatic reconnection on disconnect (3-second delay)
- Message parsing and distribution to subscribers

### Usage in React Components

```typescript
import { wsService } from '@/services/websocket';

// In component
useEffect(() => {
  // Subscribe to hotspots
  const unsubscribe = wsService.subscribe('hotspots', (data) => {
    console.log('New hotspot:', data);
    // Update state, trigger notifications, etc.
  });

  return () => unsubscribe();
}, []);
```

### Subscribing to Channels
- `hotspots` - New hotspot detections
- `alerts` - New alerts
- `recommendations` - New recommendations and status updates

## Testing

### 1. Test WebSocket Connections
```bash
python test_websocket.py
```

This will:
- Connect to all three WebSocket endpoints
- Wait for messages (5-second timeout)
- Report connection status

### 2. Manual Testing with wscat
```bash
# Install wscat
npm install -g wscat

# Test hotspots endpoint
wscat -c ws://localhost:8003/ws/hotspots

# Test alerts endpoint
wscat -c ws://localhost:8003/ws/alerts

# Test recommendations endpoint
wscat -c ws://localhost:8003/ws/recommendations
```

### 3. Generate Test Events
To see WebSocket messages in action:
1. Start orchestration engine: `cd plugins/orchestration-engine && python -m src.main`
2. Connect WebSocket client (test script or wscat)
3. Trigger hotspot scan: `curl http://localhost:8003/hotspots/scan`
4. Watch for real-time messages!

## Message Formats

### Hotspot Message
```json
{
  "id": 123,
  "entity": "Supplier A",
  "entity_type": "supplier",
  "predicted_co2": 85.5,
  "baseline_co2": 60.0,
  "percent_above": 42.5,
  "severity": "warn",
  "status": "active",
  "created_at": "2025-11-28T10:30:00Z"
}
```

### Alert Message
```json
{
  "id": 456,
  "level": "warn",
  "message": "Supplier A exceeded emissions by 42.5%",
  "hotspot_id": 123,
  "created_at": "2025-11-28T10:30:00Z"
}
```

### Recommendation Message
```json
{
  "id": 789,
  "hotspot_id": 123,
  "action": "Switch to electric vehicles for short routes",
  "co2_reduction": 15.5,
  "status": "pending",
  "root_cause": "High fuel consumption on diesel trucks",
  "created_at": "2025-11-28T10:30:00Z"
}
```

### Recommendation Status Update
```json
{
  "id": 789,
  "status": "approved",
  "action": "status_update"
}
```

## Configuration

### Backend
No additional configuration needed. WebSocket endpoints are automatically available when orchestration engine starts.

### Frontend
WebSocket URL is hardcoded to `ws://localhost:8003` in `websocket.ts`. For production, update to use environment variable:

```typescript
const ORCHESTRATION_WS_URL = import.meta.env.VITE_ORCHESTRATION_WS_URL || 'ws://localhost:8003';
```

## Troubleshooting

### Connection Refused
- Ensure orchestration engine is running on port 8003
- Check firewall settings
- Verify WebSocket endpoints with: `curl http://localhost:8003/health`

### No Messages Received
- This is normal if no events are being generated
- Trigger a hotspot scan to generate test data
- Check orchestration engine logs for errors

### Frontend Not Receiving Updates
- Open browser console and check for WebSocket connection logs
- Verify `wsService.connect()` is called on app startup
- Check that components are properly subscribed to channels

## Next Steps

1. **Add UI Notifications**: Show toast notifications when new alerts arrive
2. **Update Dashboard**: Refresh dashboard widgets when new data arrives
3. **Add Sound Alerts**: Play sound for critical alerts
4. **Add Badge Counts**: Show unread counts on navigation items
5. **Add Connection Status**: Display WebSocket connection status in UI
