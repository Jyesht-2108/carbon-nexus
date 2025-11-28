from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.utils.config import settings
from src.utils.logger import logger
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Carbon Nexus - Data Core",
    description="Data ingestion, normalization, and quality management service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1", tags=["data-core"])


@app.on_event("startup")
async def startup_event():
    logger.info("Data Core service starting up...")
    logger.info(f"API running on {settings.api_host}:{settings.api_port}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Data Core service shutting down...")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
