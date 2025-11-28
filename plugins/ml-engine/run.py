#!/usr/bin/env python3
"""
Run script for ML Engine service
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
