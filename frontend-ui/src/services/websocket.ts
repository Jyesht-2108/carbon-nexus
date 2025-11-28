const ORCHESTRATION_WS_URL = 'ws://localhost:8003';

class WebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimers: Map<string, number> = new Map();

  connect() {
    // Connect to orchestration WebSocket endpoints
    this.connectToEndpoint('hotspots', `${ORCHESTRATION_WS_URL}/ws/hotspots`);
    this.connectToEndpoint('alerts', `${ORCHESTRATION_WS_URL}/ws/alerts`);
    this.connectToEndpoint('recommendations', `${ORCHESTRATION_WS_URL}/ws/recommendations`);
  }

  private connectToEndpoint(channel: string, url: string) {
    if (this.connections.has(channel)) {
      return; // Already connected
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log(`WebSocket connected: ${channel}`);
        this.connections.set(channel, ws);
        
        // Clear reconnect timer if exists
        const timer = this.reconnectTimers.get(channel);
        if (timer) {
          clearTimeout(timer);
          this.reconnectTimers.delete(channel);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(channel, data);
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${channel}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error on ${channel}:`, error);
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected: ${channel}`);
        this.connections.delete(channel);
        
        // Attempt to reconnect after 3 seconds
        const timer = setTimeout(() => {
          console.log(`Reconnecting to ${channel}...`);
          this.connectToEndpoint(channel, url);
        }, 3000);
        
        this.reconnectTimers.set(channel, timer);
      };
    } catch (error) {
      console.error(`Error connecting to ${channel}:`, error);
    }
  }

  disconnect() {
    // Close all connections
    this.connections.forEach((ws, channel) => {
      ws.close();
      console.log(`Closed WebSocket: ${channel}`);
    });
    this.connections.clear();

    // Clear all reconnect timers
    this.reconnectTimers.forEach((timer) => clearTimeout(timer));
    this.reconnectTimers.clear();
  }

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  private notifyListeners(channel: string, data: any) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((callback) => callback(data));
    }
  }
}

export const wsService = new WebSocketService();
