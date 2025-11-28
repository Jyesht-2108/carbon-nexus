"""WebSocket broadcaster for real-time updates."""
import json
from typing import Dict, Any, List
from fastapi import WebSocket
from ..utils.logger import logger


# Connection lists (imported from main.py)
_hotspot_connections: List[WebSocket] = []
_alert_connections: List[WebSocket] = []
_recommendation_connections: List[WebSocket] = []


def set_connections(hotspots: List[WebSocket], alerts: List[WebSocket], recommendations: List[WebSocket]):
    """Set connection lists from main.py."""
    global _hotspot_connections, _alert_connections, _recommendation_connections
    _hotspot_connections = hotspots
    _alert_connections = alerts
    _recommendation_connections = recommendations


async def broadcast_hotspot(data: Dict[str, Any]) -> None:
    """Broadcast hotspot data to all connected clients."""
    if not _hotspot_connections:
        return
    
    message = json.dumps(data)
    disconnected = []
    
    for connection in _hotspot_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            logger.error(f"Error broadcasting hotspot: {e}")
            disconnected.append(connection)
    
    # Remove disconnected clients
    for conn in disconnected:
        _hotspot_connections.remove(conn)
    
    logger.info(f"Broadcasted hotspot to {len(_hotspot_connections)} clients")


async def broadcast_alert(data: Dict[str, Any]) -> None:
    """Broadcast alert data to all connected clients."""
    if not _alert_connections:
        return
    
    message = json.dumps(data)
    disconnected = []
    
    for connection in _alert_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            logger.error(f"Error broadcasting alert: {e}")
            disconnected.append(connection)
    
    # Remove disconnected clients
    for conn in disconnected:
        _alert_connections.remove(conn)
    
    logger.info(f"Broadcasted alert to {len(_alert_connections)} clients")


async def broadcast_recommendation(data: Dict[str, Any]) -> None:
    """Broadcast recommendation data to all connected clients."""
    if not _recommendation_connections:
        return
    
    message = json.dumps(data)
    disconnected = []
    
    for connection in _recommendation_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            logger.error(f"Error broadcasting recommendation: {e}")
            disconnected.append(connection)
    
    # Remove disconnected clients
    for conn in disconnected:
        _recommendation_connections.remove(conn)
    
    logger.info(f"Broadcasted recommendation to {len(_recommendation_connections)} clients")
