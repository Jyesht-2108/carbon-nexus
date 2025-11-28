# WebSocket Quick Start

## 🚀 Start Services

```bash
# Start orchestration engine (includes WebSocket server)
cd plugins/orchestration-engine
python -m src.main
```

## 🧪 Test WebSocket Connections

```bash
# Run test script
python test_websocket.py
```

## 📡 WebSocket Endpoints

- `ws://localhost:8003/ws/hotspots`
- `ws://localhost:8003/ws/alerts`
- `ws://localhost:8003/ws/recommendations`

## 💻 Frontend Usage

```typescript
import { wsService } from '@/services/websocket';

// Connect (call once on app startup)
wsService.connect();

// Subscribe to updates
useEffect(() => {
  const unsubscribe = wsService.subscribe('hotspots', (data) => {
    console.log('New hotspot:', data);
    // Update your state here
  });
  
  return () => unsubscribe();
}, []);
```

## 🔥 Trigger Test Events

```bash
# Trigger hotspot scan to generate WebSocket messages
curl http://localhost:8003/hotspots/scan
```

## 📊 What Gets Broadcasted

| Event | Endpoint | Trigger |
|-------|----------|---------|
| New hotspot detected | `/ws/hotspots` | Hotspot engine detects anomaly |
| New alert created | `/ws/alerts` | Alert generated from hotspot |
| New recommendation | `/ws/recommendations` | RAG generates recommendation |
| Recommendation approved | `/ws/recommendations` | User approves recommendation |
| Recommendation rejected | `/ws/recommendations` | User rejects recommendation |

## ✅ Verification

1. Start orchestration engine
2. Run `python test_websocket.py` - should see "Connected" messages
3. Trigger hotspot scan - should see real-time messages
4. Check frontend console - should see WebSocket connection logs

## 🐛 Troubleshooting

**No connection?**
- Check orchestration engine is running: `curl http://localhost:8003/health`
- Check port 8003 is not blocked

**No messages?**
- Normal if no events are being generated
- Trigger test: `curl http://localhost:8003/hotspots/scan`

**Frontend not updating?**
- Check browser console for WebSocket logs
- Verify `wsService.connect()` is called
- Check component subscriptions are set up correctly
