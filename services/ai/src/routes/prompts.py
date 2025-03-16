from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from src.services.prompt_service import prompt_service

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# Define request and response models
class PromptRequest(BaseModel):
    template_name: str
    context: Dict[str, Any]


class PromptResponse(BaseModel):
    prompt: str


class TemplatesResponse(BaseModel):
    templates: List[str]


# Generate prompt endpoint
@router.post("/generate", response_model=PromptResponse)
async def generate_prompt(request: PromptRequest):
    """
    Generate a prompt using a template and context data
    """
    try:
        logger.info(f"Generating prompt with template '{request.template_name}'")
        prompt = prompt_service.generate_prompt(request.template_name, request.context)
        return {"prompt": prompt}
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get available templates endpoint
@router.get("/templates", response_model=TemplatesResponse)
async def get_templates():
    """
    Get a list of available template names
    """
    try:
        logger.info("Getting available templates")
        templates = prompt_service.get_available_templates()
        return {"templates": templates}
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))
