"""Hotspot detection engine."""
from typing import Dict, Any, Optional, List
from datetime import datetime
from ..utils.config import settings
from ..utils.logger import logger
from ..db.supabase_client import db_client
from .ml_client import ml_client
from .rag_client import rag_client


class HotspotEngine:
    """Engine for detecting emission hotspots."""
    
    def __init__(self):
        """Initialize hotspot engine."""
        self.thresholds = {
            "info": settings.threshold_info,
            "warn": settings.threshold_warn,
            "critical": settings.threshold_critical
        }
    
    def calculate_severity(self, predicted: float, baseline: float) -> str:
        """Calculate hotspot severity level."""
        if baseline == 0:
            return "critical"
        
        ratio = predicted / baseline
        
        if ratio >= self.thresholds["critical"]:
            return "critical"
        elif ratio >= self.thresholds["warn"]:
            return "warn"
        elif ratio >= self.thresholds["info"]:
            return "info"
        else:
            return "normal"
    
    def calculate_percent_above(self, predicted: float, baseline: float) -> float:
        """Calculate percentage above baseline."""
        if baseline == 0:
            return 100.0
        return ((predicted - baseline) / baseline) * 100
    
    async def detect_hotspots_for_event(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Detect hotspot for a single event."""
        try:
            # Determine entity and type
            entity = event.get("supplier_name") or event.get("route_id") or "Unknown"
            entity_type = "supplier" if event.get("supplier_name") else "route"
            
            # Get prediction based on event type
            predicted_co2 = await self._get_prediction(event)
            if predicted_co2 is None:
                logger.warning(f"Could not get prediction for event {event.get('id')}")
                return None
            
            # Get baseline
            baseline = await db_client.get_baseline(entity, entity_type)
            if baseline is None:
                # Calculate baseline from recent history
                baseline = await self._calculate_baseline(entity, entity_type)
                if baseline:
                    await db_client.upsert_baseline({
                        "entity": entity,
                        "entity_type": entity_type,
                        "baseline_value": baseline,
                        "updated_at": datetime.utcnow().isoformat()
                    })
            
            if baseline is None:
                logger.warning(f"No baseline available for {entity}")
                return None
            
            # Calculate severity
            severity = self.calculate_severity(predicted_co2, baseline)
            
            # Only create hotspot if above info threshold
            if severity == "normal":
                return None
            
            percent_above = self.calculate_percent_above(predicted_co2, baseline)
            
            # Create hotspot
            hotspot = {
                "entity": entity,
                "entity_type": entity_type,
                "predicted_co2": predicted_co2,
                "baseline_co2": baseline,
                "percent_above": percent_above,
                "severity": severity,
                "status": "active",
                "event_id": event.get("id"),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert hotspot
            inserted_hotspot = await db_client.insert_hotspot(hotspot)
            if not inserted_hotspot:
                return None
            
            logger.info(f"Hotspot detected: {entity} ({severity}) - {percent_above:.1f}% above baseline")
            
            # Generate alert
            await self._generate_alert(inserted_hotspot)
            
            # Generate recommendations via RAG
            await self._generate_recommendations(inserted_hotspot)
            
            return inserted_hotspot
            
        except Exception as e:
            logger.error(f"Error detecting hotspot: {e}")
            return None
    
    async def _get_prediction(self, event: Dict[str, Any]) -> Optional[float]:
        """Get ML prediction for event."""
        # Determine event type and prepare features
        if event.get("distance_km"):
            # Logistics event
            features = {
                "distance_km": event.get("distance_km", 0),
                "load_kg": event.get("load_weight_kg", 0),
                "vehicle_type": event.get("vehicle_type", "truck_diesel"),
                "fuel_type": event.get("fuel_type", "diesel"),
                "avg_speed": event.get("avg_speed", 50)
            }
            return await ml_client.predict_logistics(features)
        
        elif event.get("energy_kwh"):
            # Factory or warehouse event
            if event.get("furnace_usage"):
                # Factory
                features = {
                    "energy_kwh": event.get("energy_kwh", 0),
                    "furnace_usage": event.get("furnace_usage", 0),
                    "cooling_load": event.get("cooling_load", 0),
                    "shift_hours": event.get("shift_hours", 8)
                }
                return await ml_client.predict_factory(features)
            else:
                # Warehouse
                features = {
                    "temperature": event.get("temperature", 20),
                    "refrigeration_load": event.get("refrigeration_load", 0),
                    "inventory_volume": event.get("inventory_volume", 0),
                    "energy_kwh": event.get("energy_kwh", 0)
                }
                return await ml_client.predict_warehouse(features)
        
        return None
    
    async def _calculate_baseline(self, entity: str, entity_type: str) -> Optional[float]:
        """Calculate baseline from historical data."""
        try:
            # Get recent events for this entity
            events = await db_client.get_recent_events(limit=100)
            
            # Filter by entity
            entity_events = [
                e for e in events
                if (e.get("supplier_name") == entity or e.get("route_id") == entity)
            ]
            
            if not entity_events:
                return None
            
            # Calculate average CO2 (simplified - in production, use predictions)
            # For now, use a default baseline
            return 60.0  # Default baseline
            
        except Exception as e:
            logger.error(f"Error calculating baseline: {e}")
            return None
    
    async def _generate_alert(self, hotspot: Dict[str, Any]) -> None:
        """Generate alert for hotspot."""
        try:
            alert = {
                "level": hotspot["severity"],
                "message": f"{hotspot['entity']} exceeded emissions by {hotspot['percent_above']:.1f}%",
                "hotspot_id": hotspot["id"],
                "created_at": datetime.utcnow().isoformat()
            }
            
            await db_client.insert_alert(alert)
            logger.info(f"Alert generated for hotspot {hotspot['id']}")
            
        except Exception as e:
            logger.error(f"Error generating alert: {e}")
    
    async def _generate_recommendations(self, hotspot: Dict[str, Any]) -> None:
        """Generate recommendations via RAG for hotspot."""
        try:
            # Prepare hotspot reason
            reason = f"Emissions {hotspot['percent_above']:.1f}% above baseline"
            
            # Call RAG service
            result = await rag_client.generate_recommendations(
                supplier=hotspot["entity"],
                predicted=hotspot["predicted_co2"],
                baseline=hotspot["baseline_co2"],
                hotspot_reason=reason,
                hotspot_id=hotspot["id"]
            )
            
            if result:
                logger.info(f"Recommendations generated for hotspot {hotspot['id']}")
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
    
    async def scan_for_hotspots(self) -> List[Dict[str, Any]]:
        """Scan recent events for hotspots."""
        try:
            logger.info("Starting hotspot scan...")
            
            # Get events without predictions
            events = await db_client.get_events_without_predictions(limit=50)
            
            hotspots = []
            for event in events:
                hotspot = await self.detect_hotspots_for_event(event)
                if hotspot:
                    hotspots.append(hotspot)
            
            logger.info(f"Hotspot scan complete. Found {len(hotspots)} hotspots.")
            return hotspots
            
        except Exception as e:
            logger.error(f"Error scanning for hotspots: {e}")
            return []


# Singleton instance
hotspot_engine = HotspotEngine()
