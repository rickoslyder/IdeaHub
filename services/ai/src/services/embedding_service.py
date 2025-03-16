import os
import logging
from typing import List, Optional
import torch
from sentence_transformers import SentenceTransformer
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating embeddings from text using sentence-transformers
    """

    def __init__(self, model_name: Optional[str] = None, device: Optional[str] = None):
        """
        Initialize the embedding service with the specified model

        Args:
            model_name: Name of the sentence-transformers model to use
            device: Device to use for computation (cpu or cuda)
        """
        self.model_name = model_name or os.getenv(
            "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        )
        self.device = device or os.getenv("DEVICE", "cpu")
        self.model = None
        self.embedding_dim = int(os.getenv("EMBEDDING_DIMENSION", "384"))
        logger.info(
            f"Initializing EmbeddingService with model {self.model_name} on {self.device}"
        )

    def load_model(self):
        """
        Load the embedding model if not already loaded
        """
        if self.model is None:
            logger.info(f"Loading model {self.model_name}...")
            try:
                self.model = SentenceTransformer(self.model_name, device=self.device)
                logger.info(
                    f"Model loaded successfully with dimension {self.model.get_sentence_embedding_dimension()}"
                )
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                raise RuntimeError(f"Failed to load embedding model: {e}")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts

        Args:
            texts: List of texts to generate embeddings for

        Returns:
            List of embedding vectors (as lists of floats)
        """
        if not texts:
            return []

        # Load model if not loaded
        if self.model is None:
            self.load_model()

        try:
            # Generate embeddings
            embeddings = self.model.encode(texts, convert_to_numpy=True)

            # Convert to list of lists for JSON serialization
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise RuntimeError(f"Failed to generate embeddings: {e}")

    def compute_similarity(
        self, embedding1: List[float], embedding2: List[float]
    ) -> float:
        """
        Compute cosine similarity between two embeddings

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity score between 0 and 1
        """
        # Convert to numpy arrays
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)

        # Compute cosine similarity
        dot_product = np.dot(emb1, emb2)
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))


# Singleton instance
embedding_service = EmbeddingService()
