import os
import logging
from typing import List, Dict, Any, Optional, Union
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logger = logging.getLogger("ai-service")

# Dictionary to store loaded models for reuse
MODELS = {}


def get_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    """
    Load and cache a sentence transformer model.

    Args:
        model_name: Name of the model to load (default: all-MiniLM-L6-v2)

    Returns:
        Loaded SentenceTransformer model
    """
    if model_name not in MODELS:
        logger.info(f"Loading model: {model_name}")
        try:
            MODELS[model_name] = SentenceTransformer(model_name)
            logger.info(f"Model {model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            # Fallback to a default model if the requested one fails
            if model_name != "all-MiniLM-L6-v2":
                logger.info("Falling back to default model: all-MiniLM-L6-v2")
                return get_model("all-MiniLM-L6-v2")
            else:
                raise

    return MODELS[model_name]


def generate_embeddings(
    texts: List[str], model_name: str = "all-MiniLM-L6-v2"
) -> List[List[float]]:
    """
    Generate embeddings for a list of texts.

    Args:
        texts: List of text strings to embed
        model_name: Name of the model to use (default: all-MiniLM-L6-v2)

    Returns:
        List of embedding vectors (as lists of floats)
    """
    if not texts:
        return []

    try:
        model = get_model(model_name)
        embeddings = model.encode(texts)
        return (
            embeddings.tolist()
        )  # Convert numpy arrays to lists for JSON serialization
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise


def compute_similarity(
    query_embedding: List[float], document_embeddings: List[List[float]]
) -> List[float]:
    """
    Compute cosine similarity between a query embedding and a list of document embeddings.

    Args:
        query_embedding: Embedding vector for the query
        document_embeddings: List of embedding vectors for documents

    Returns:
        List of similarity scores (0-1) for each document
    """
    if not document_embeddings:
        return []

    query_array = np.array(query_embedding).reshape(1, -1)
    docs_array = np.array(document_embeddings)

    # Compute cosine similarity
    similarities = cosine_similarity(query_array, docs_array)[0].tolist()
    return similarities


def rank_by_relevance(
    query: str, documents: List[str], model_name: str = "all-MiniLM-L6-v2"
) -> List[Dict[str, Any]]:
    """
    Rank documents by relevance to a query.

    Args:
        query: Query string
        documents: List of document strings
        model_name: Name of the model to use

    Returns:
        List of dictionaries with document index, content, and similarity score,
        sorted by descending similarity
    """
    if not documents:
        return []

    # Generate embeddings
    model = get_model(model_name)
    query_embedding = model.encode(query).tolist()
    doc_embeddings = model.encode(documents).tolist()

    # Compute similarities
    similarities = compute_similarity(query_embedding, doc_embeddings)

    # Create result with documents and scores
    results = [
        {"index": i, "content": doc, "similarity": score}
        for i, (doc, score) in enumerate(zip(documents, similarities))
    ]

    # Sort by similarity score (descending)
    results.sort(key=lambda x: x["similarity"], reverse=True)

    return results
