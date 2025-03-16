from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import dotenv
from pathlib import Path
import logging

# Load environment variables
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO if os.getenv("DEBUG") == "true" else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Idea Hub AI Service",
    description="AI service for generating embeddings and prompts",
    version="1.0.0",
)


# Define response models
class HealthResponse(BaseModel):
    status: str
    version: str


# Health check endpoint
@app.get("/", response_model=HealthResponse)
async def root():
    return {
        "status": "operational",
        "version": "1.0.0",
    }


# Import and include routers
from src.routes.embeddings import router as embeddings_router
from src.routes.prompts import router as prompts_router

app.include_router(embeddings_router, prefix="/embeddings", tags=["embeddings"])
app.include_router(prompts_router, prefix="/prompts", tags=["prompts"])


# Error handlers
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return {"detail": "Internal server error"}


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up AI service...")
    # Initialize models and services here if needed


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down AI service...")
    # Clean up resources here if needed
