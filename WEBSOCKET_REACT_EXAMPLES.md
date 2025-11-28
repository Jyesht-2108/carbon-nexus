# WebSocket React Component Examples

## Basic Setup

### App.tsx - Initialize WebSocket on Startup

```typescript
import { useEffect } from 'react';
import { wsService } from '@/services/websocket';

function App() {
  useEffect(() => {
    // Connect to all WebSocket endpoints
    wsService.connect();
    
    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

## Example Components

### 1. Hotspot Monitor Component

```typescript
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';

interface Hotspot {
  id: number;
  entity: string;
  severity: 'info' | 'warn' | 'critical';
  percent_above: number;
  predicted_co2: number;
  baseline_co2: number;
}

export function HotspotMonitor() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [latestHotspot, setLatestHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    // Subscribe to hotspot updates
    const unsubscribe = wsService.subscribe('hotspots', (data: Hotspot) => {
      console.log('New hotspot received:', data);
      
      // Add to list
      setHotspots(prev => [data, ...prev].slice(0, 10)); // Keep last 10
      
      // Set as latest
      setLatestHotspot(data);
      
      // Show notification
      if (data.severity === 'critical') {
        showNotification('Critical Hotspot Detected!', data.entity);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="hotspot-monitor">
      <h2>Live Hotspots</h2>
      
      {latestHotspot && (
        <div className={`latest-hotspot ${latestHotspot.severity}`}>
          <h3>Latest: {latestHotspot.entity}</h3>
          <p>{latestHotspot.percent_above.toFixed(1)}% above baseline</p>
        </div>
      )}
      
      <ul>
        {hotspots.map(hotspot => (
          <li key={hotspot.id} className={hotspot.severity}>
            <strong>{hotspot.entity}</strong>
            <span>{hotspot.percent_above.toFixed(1)}% above</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. Alert Notification Component

```typescript
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';
import { toast } from 'react-hot-toast'; // or your notification library

interface Alert {
  id: number;
  level: 'info' | 'warn' | 'critical';
  message: string;
  created_at: string;
}

export function AlertNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = wsService.subscribe('alerts', (data: Alert) => {
      console.log('New alert received:', data);
      
      // Add to alerts list
      setAlerts(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      const toastOptions = {
        duration: data.level === 'critical' ? 10000 : 5000,
        icon: data.level === 'critical' ? '🚨' : '⚠️',
      };
      
      if (data.level === 'critical') {
        toast.error(data.message, toastOptions);
        // Play sound for critical alerts
        playAlertSound();
      } else if (data.level === 'warn') {
        toast.warning(data.message, toastOptions);
      } else {
        toast(data.message, toastOptions);
      }
    });

    return () => unsubscribe();
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="alert-notifications">
      <div className="alert-header">
        <h3>Alerts</h3>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
        <button onClick={markAllRead}>Mark all read</button>
      </div>
      
      <ul className="alert-list">
        {alerts.map(alert => (
          <li key={alert.id} className={`alert-item ${alert.level}`}>
            <div className="alert-message">{alert.message}</div>
            <div className="alert-time">
              {new Date(alert.created_at).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function playAlertSound() {
  const audio = new Audio('/alert-sound.mp3');
  audio.play().catch(err => console.error('Error playing sound:', err));
}
```

### 3. Recommendation Feed Component

```typescript
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';

interface Recommendation {
  id: number;
  action: string;
  co2_reduction: number;
  status: 'pending' | 'approved' | 'rejected';
  root_cause?: string;
  created_at: string;
}

export function RecommendationFeed() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const unsubscribe = wsService.subscribe('recommendations', (data: any) => {
      console.log('Recommendation update:', data);
      
      if (data.action === 'status_update') {
        // Update existing recommendation status
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === data.id ? { ...rec, status: data.status } : rec
          )
        );
      } else {
        // New recommendation
        setRecommendations(prev => [data, ...prev]);
        setNewCount(prev => prev + 1);
        
        // Show notification
        toast.success(`New recommendation: ${data.action.substring(0, 50)}...`);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearNewCount = () => setNewCount(0);

  return (
    <div className="recommendation-feed">
      <div className="feed-header">
        <h2>Recommendations</h2>
        {newCount > 0 && (
          <span className="new-badge" onClick={clearNewCount}>
            {newCount} new
          </span>
        )}
      </div>
      
      <div className="recommendations-list">
        {recommendations.map(rec => (
          <div key={rec.id} className={`recommendation-card ${rec.status}`}>
            <div className="rec-header">
              <span className={`status-badge ${rec.status}`}>
                {rec.status}
              </span>
              <span className="co2-reduction">
                -{rec.co2_reduction.toFixed(1)} kg CO₂
              </span>
            </div>
            
            <p className="rec-action">{rec.action}</p>
            
            {rec.root_cause && (
              <p className="rec-cause">
                <strong>Root cause:</strong> {rec.root_cause}
              </p>
            )}
            
            <div className="rec-footer">
              <span className="rec-time">
                {new Date(rec.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Dashboard with Live Updates

```typescript
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';

export function LiveDashboard() {
  const [stats, setStats] = useState({
    totalHotspots: 0,
    criticalAlerts: 0,
    pendingRecommendations: 0,
  });

  useEffect(() => {
    // Subscribe to all channels
    const unsubHotspots = wsService.subscribe('hotspots', () => {
      setStats(prev => ({ ...prev, totalHotspots: prev.totalHotspots + 1 }));
    });

    const unsubAlerts = wsService.subscribe('alerts', (data: any) => {
      if (data.level === 'critical') {
        setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));
      }
    });

    const unsubRecs = wsService.subscribe('recommendations', (data: any) => {
      if (data.status === 'pending') {
        setStats(prev => ({ 
          ...prev, 
          pendingRecommendations: prev.pendingRecommendations + 1 
        }));
      }
    });

    return () => {
      unsubHotspots();
      unsubAlerts();
      unsubRecs();
    };
  }, []);

  return (
    <div className="live-dashboard">
      <div className="stat-card">
        <h3>Total Hotspots</h3>
        <div className="stat-value">{stats.totalHotspots}</div>
      </div>
      
      <div className="stat-card critical">
        <h3>Critical Alerts</h3>
        <div className="stat-value">{stats.criticalAlerts}</div>
      </div>
      
      <div className="stat-card">
        <h3>Pending Recommendations</h3>
        <div className="stat-value">{stats.pendingRecommendations}</div>
      </div>
    </div>
  );
}
```

### 5. Connection Status Indicator

```typescript
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = () => {
      // You can enhance wsService to expose connection status
      setIsConnected(true); // Simplified
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="status-dot"></span>
      <span className="status-text">
        {isConnected ? 'Live' : 'Reconnecting...'}
      </span>
    </div>
  );
}
```

## Custom Hook Example

```typescript
// hooks/useWebSocketChannel.ts
import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocketChannel<T>(channel: string) {
  const [data, setData] = useState<T[]>([]);
  const [latest, setLatest] = useState<T | null>(null);

  useEffect(() => {
    const unsubscribe = wsService.subscribe(channel, (newData: T) => {
      setData(prev => [newData, ...prev]);
      setLatest(newData);
    });

    return () => unsubscribe();
  }, [channel]);

  return { data, latest };
}

// Usage in component
function MyComponent() {
  const { data: hotspots, latest: latestHotspot } = useWebSocketChannel<Hotspot>('hotspots');
  
  return (
    <div>
      {latestHotspot && <div>Latest: {latestHotspot.entity}</div>}
      <ul>
        {hotspots.map(h => <li key={h.id}>{h.entity}</li>)}
      </ul>
    </div>
  );
}
```

## State Management Integration

### With Redux

```typescript
// store/websocketMiddleware.ts
import { wsService } from '@/services/websocket';
import { addHotspot, addAlert, addRecommendation } from './slices';

export const websocketMiddleware = (store: any) => {
  // Subscribe to WebSocket channels
  wsService.subscribe('hotspots', (data) => {
    store.dispatch(addHotspot(data));
  });

  wsService.subscribe('alerts', (data) => {
    store.dispatch(addAlert(data));
  });

  wsService.subscribe('recommendations', (data) => {
    store.dispatch(addRecommendation(data));
  });

  return (next: any) => (action: any) => next(action);
};
```

### With Zustand

```typescript
// store/useWebSocketStore.ts
import create from 'zustand';
import { wsService } from '@/services/websocket';

interface WebSocketStore {
  hotspots: Hotspot[];
  alerts: Alert[];
  recommendations: Recommendation[];
  addHotspot: (hotspot: Hotspot) => void;
  addAlert: (alert: Alert) => void;
  addRecommendation: (rec: Recommendation) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  hotspots: [],
  alerts: [],
  recommendations: [],
  
  addHotspot: (hotspot) =>
    set((state) => ({ hotspots: [hotspot, ...state.hotspots] })),
  
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),
  
  addRecommendation: (rec) =>
    set((state) => ({ recommendations: [rec, ...state.recommendations] })),
}));

// Initialize subscriptions
wsService.subscribe('hotspots', useWebSocketStore.getState().addHotspot);
wsService.subscribe('alerts', useWebSocketStore.getState().addAlert);
wsService.subscribe('recommendations', useWebSocketStore.getState().addRecommendation);
```

## Best Practices

1. **Always unsubscribe**: Use cleanup functions in useEffect
2. **Handle errors**: Wrap WebSocket callbacks in try-catch
3. **Limit data**: Keep only recent items (e.g., last 50)
4. **Debounce updates**: For high-frequency updates
5. **Show connection status**: Let users know if disconnected
6. **Persist important data**: Don't rely only on WebSocket state
7. **Test reconnection**: Ensure UI handles reconnects gracefully
