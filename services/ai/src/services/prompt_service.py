import os
import logging
from typing import Dict, Any, List, Optional
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class PromptService:
    """
    Service for generating prompts for AI models based on project data
    """

    def __init__(self):
        """
        Initialize the prompt service
        """
        self.templates = {
            "project_summary": "# Project Summary for {project_name}\n\n"
            "## Description\n{project_description}\n\n"
            "## Status\nCurrent status: {project_status}\n\n"
            "## Tags\n{project_tags}\n\n"
            "## Documentation\n{project_documentation}\n\n"
            "## Related Developments\n{related_developments}",
            "development_application": "# How to Apply Development to Project\n\n"
            "## Development\n{development_content}\n\n"
            "## Project\n{project_name}: {project_description}\n\n"
            "## Suggested Application\nBased on the development and project details, "
            "here are specific ways to apply this development to the project:\n\n"
            "1. Consider how {development_content} could enhance {project_name}\n"
            "2. Look for integration points between the development and project\n"
            "3. Identify potential challenges and solutions",
            "project_improvement": "# Project Improvement Suggestions\n\n"
            "## Project\n{project_name}: {project_description}\n\n"
            "## Current Status\n{project_status}\n\n"
            "## Improvement Areas\nBased on the project details, "
            "here are potential areas for improvement:\n\n"
            "1. Consider enhancing {project_name} by...\n"
            "2. Look for opportunities to improve...\n"
            "3. Address potential challenges such as...",
        }

    def generate_prompt(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Generate a prompt using a template and context data

        Args:
            template_name: Name of the template to use
            context: Dictionary of context variables to fill in the template

        Returns:
            Formatted prompt string
        """
        if template_name not in self.templates:
            logger.error(f"Template '{template_name}' not found")
            raise ValueError(f"Template '{template_name}' not found")

        try:
            # Get the template
            template = self.templates[template_name]

            # Format the template with context
            prompt = template.format(**context)

            return prompt
        except KeyError as e:
            logger.error(f"Missing context variable: {e}")
            raise ValueError(f"Missing context variable: {e}")
        except Exception as e:
            logger.error(f"Error generating prompt: {e}")
            raise RuntimeError(f"Failed to generate prompt: {e}")

    def get_available_templates(self) -> List[str]:
        """
        Get a list of available template names

        Returns:
            List of template names
        """
        return list(self.templates.keys())


# Singleton instance
prompt_service = PromptService()
