"""Main FastAPI application for Orchestration Engine."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .utils.config import settings
from .utils.logger import logger
from .api import routes_dashboard, routes_hotspots, routes_recommendations, routes_simulation, routes_alerts
from .services.scheduler import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("Starting Orchestration Engine...")
    logger.info(f"ML Engine URL: {settings.ml_engine_url}")
    logger.info(f"Data Core URL: {settings.data_core_url}")
    logger.info(f"RAG Service URL: {settings.rag_service_url}")
    
    # Start scheduler
    scheduler.start()
    logger.info("Scheduler started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Orchestration Engine...")
    scheduler.shutdown()
    logger.info("Scheduler stopped")


# Create FastAPI app
app = FastAPI(
    title="Carbon Nexus Orchestration Engine",
    description="Central orchestration hub for Carbon Nexus platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes_dashboard.router)
app.include_router(routes_hotspots.router)
app.include_router(routes_recommendations.router)
app.include_router(routes_simulation.router)
app.include_router(routes_alerts.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "orchestration-engine",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Carbon Nexus Orchestration Engine",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "emissions": "/emissions/*",
            "hotspots": "/hotspots/*",
            "recommendations": "/recommendations/*",
            "simulate": "/simulate",
            "alerts": "/alerts/*"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
