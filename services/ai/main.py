from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv

# Import local modules
from embedding import generate_embeddings, rank_by_relevance
from prompt import (
    generate_prompt,
    generate_technical_prompt,
    generate_brainstorming_prompt,
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("ai-service")

# Create FastAPI app
app = FastAPI(
    title="Idea Hub AI Service",
    description="AI Service for the Idea Hub application",
    version="1.0.0",
)


# Define data models
class EmbeddingRequest(BaseModel):
    texts: List[str]
    model: Optional[str] = "all-MiniLM-L6-v2"  # Default to all-MiniLM-L6-v2 model


class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model: str


class RelevanceRequest(BaseModel):
    query: str
    documents: List[str]
    model: Optional[str] = "all-MiniLM-L6-v2"


class RelevanceResponse(BaseModel):
    results: List[dict]
    model: str


class PromptRequest(BaseModel):
    project_context: str
    development_context: Optional[str] = None
    question: Optional[str] = None


class PromptResponse(BaseModel):
    prompt: str


class TechnicalPromptRequest(BaseModel):
    project_context: str
    code_snippets: Optional[str] = None
    error_message: Optional[str] = None
    specific_task: Optional[str] = None


class BrainstormPromptRequest(BaseModel):
    project_context: str
    current_ideas: Optional[str] = None
    focus_area: Optional[str] = None


# Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to Idea Hub AI Service"}


@app.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    try:
        logger.info(
            f"Generating embeddings for {len(request.texts)} texts using {request.model}"
        )

        embeddings = generate_embeddings(request.texts, request.model)

        return EmbeddingResponse(embeddings=embeddings, model=request.model)
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating embeddings: {str(e)}"
        )


@app.post("/relevance", response_model=RelevanceResponse)
async def compute_relevance(request: RelevanceRequest):
    try:
        logger.info(
            f"Computing relevance for query against {len(request.documents)} documents"
        )

        results = rank_by_relevance(request.query, request.documents, request.model)

        return RelevanceResponse(results=results, model=request.model)
    except Exception as e:
        logger.error(f"Error computing relevance: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error computing relevance: {str(e)}"
        )


@app.post("/prompts/general", response_model=PromptResponse)
async def create_general_prompt(request: PromptRequest):
    try:
        logger.info("Generating general prompt")

        prompt = generate_prompt(
            project_context=request.project_context,
            development_context=request.development_context,
            question=request.question,
        )

        return PromptResponse(prompt=prompt)
    except Exception as e:
        logger.error(f"Error generating prompt: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating prompt: {str(e)}"
        )


@app.post("/prompts/technical", response_model=PromptResponse)
async def create_technical_prompt(request: TechnicalPromptRequest):
    try:
        logger.info("Generating technical prompt")

        prompt = generate_technical_prompt(
            project_context=request.project_context,
            code_snippets=request.code_snippets,
            error_message=request.error_message,
            specific_task=request.specific_task,
        )

        return PromptResponse(prompt=prompt)
    except Exception as e:
        logger.error(f"Error generating technical prompt: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating technical prompt: {str(e)}"
        )


@app.post("/prompts/brainstorm", response_model=PromptResponse)
async def create_brainstorm_prompt(request: BrainstormPromptRequest):
    try:
        logger.info("Generating brainstorming prompt")

        prompt = generate_brainstorming_prompt(
            project_context=request.project_context,
            current_ideas=request.current_ideas,
            focus_area=request.focus_area,
        )

        return PromptResponse(prompt=prompt)
    except Exception as e:
        logger.error(f"Error generating brainstorming prompt: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating brainstorming prompt: {str(e)}"
        )


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Run the application
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
