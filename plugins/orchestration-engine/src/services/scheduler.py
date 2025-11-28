"""Scheduler for periodic tasks."""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from ..utils.config import settings
from ..utils.logger import logger
from .hotspot_engine import hotspot_engine


class OrchestrationScheduler:
    """Scheduler for orchestration engine tasks."""
    
    def __init__(self):
        """Initialize scheduler."""
        self.scheduler = AsyncIOScheduler()
        self._setup_jobs()
    
    def _setup_jobs(self):
        """Setup scheduled jobs."""
        # Hotspot detection every 5 minutes
        self.scheduler.add_job(
            self._run_hotspot_scan,
            trigger=IntervalTrigger(seconds=settings.hotspot_check_interval),
            id="hotspot_scan",
            name="Hotspot Detection Scan",
            replace_existing=True
        )
        
        # Baseline recalculation every hour
        self.scheduler.add_job(
            self._recalculate_baselines,
            trigger=IntervalTrigger(seconds=settings.baseline_recalc_interval),
            id="baseline_recalc",
            name="Baseline Recalculation",
            replace_existing=True
        )
        
        logger.info("Scheduled jobs configured")
    
    async def _run_hotspot_scan(self):
        """Run hotspot detection scan."""
        try:
            logger.info("Running scheduled hotspot scan...")
            hotspots = await hotspot_engine.scan_for_hotspots()
            logger.info(f"Scheduled scan complete. Found {len(hotspots)} hotspots.")
        except Exception as e:
            logger.error(f"Error in scheduled hotspot scan: {e}")
    
    async def _recalculate_baselines(self):
        """Recalculate baselines for all entities."""
        try:
            logger.info("Running baseline recalculation...")
            # TODO: Implement baseline recalculation logic
            logger.info("Baseline recalculation complete")
        except Exception as e:
            logger.error(f"Error in baseline recalculation: {e}")
    
    def start(self):
        """Start the scheduler."""
        self.scheduler.start()
        logger.info("Scheduler started")
    
    def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler shutdown")


# Singleton instance
scheduler = OrchestrationScheduler()
