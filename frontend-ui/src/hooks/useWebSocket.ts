import { useEffect } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocket(channel: string, callback: (data: any) => void) {
  useEffect(() => {
    wsService.connect();
    const unsubscribe = wsService.subscribe(channel, callback);

    return () => {
      unsubscribe();
    };
  }, [channel, callback]);
}
