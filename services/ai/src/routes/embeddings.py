from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from src.services.embedding_service import embedding_service

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# Define request and response models
class EmbeddingRequest(BaseModel):
    texts: List[str]


class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]


class SimilarityRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]


class SimilarityResponse(BaseModel):
    similarity: float


# Generate embeddings endpoint
@router.post("/generate", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """
    Generate embeddings for a list of texts
    """
    try:
        logger.info(f"Generating embeddings for {len(request.texts)} texts")
        embeddings = embedding_service.generate_embeddings(request.texts)
        return {"embeddings": embeddings}
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Compute similarity endpoint
@router.post("/similarity", response_model=SimilarityResponse)
async def compute_similarity(request: SimilarityRequest):
    """
    Compute cosine similarity between two embeddings
    """
    try:
        logger.info("Computing similarity between embeddings")
        similarity = embedding_service.compute_similarity(
            request.embedding1, request.embedding2
        )
        return {"similarity": similarity}
    except Exception as e:
        logger.error(f"Error computing similarity: {e}")
        raise HTTPException(status_code=500, detail=str(e))
