"""LuminFlow AI Backend — FastAPI entry point."""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure server directory is on the Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.chat import router as chat_router
from routes.impact import router as impact_router
from routes.narrative import router as narrative_router
from routes.sampling import router as sampling_router

# Load environment variables from .env file
load_dotenv()

# ─── App Initialization ──────────────────────────────────────────────────────

app = FastAPI(
    title="LuminFlow AI Backend",
    description="Intelligent audit assistant powered by COSO 2013 framework — 4 AI Pipelines",
    version="1.0.0",
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routes ─────────────────────────────────────────────────────────

app.include_router(chat_router)
app.include_router(sampling_router)
app.include_router(impact_router)
app.include_router(narrative_router)


# ─── Root & Health Check ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Root endpoint — confirms the server is running."""
    return {
        "service": "LuminFlow AI Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "LuminFlow AI Backend",
        "version": "1.0.0",
        "pipelines": [
            "risk_analyzer",
            "sample_recommender",
            "impact_simulator",
            "narrative_generator",
        ],
    }


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
