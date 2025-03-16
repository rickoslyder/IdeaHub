import logging
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger("ai-service")

# Base prompt template for software development assistance
BASE_PROMPT_TEMPLATE = """
You are an AI assistant helping with a software development project. Here's the context:

PROJECT CONTEXT:
{project_context}

{development_context}

{question}

Based on the above context, please provide a detailed and helpful response.
"""


def generate_prompt(
    project_context: str,
    development_context: Optional[str] = None,
    question: Optional[str] = None,
) -> str:
    """
    Generate a prompt for an AI assistant based on project and development context.

    Args:
        project_context: Information about the project
        development_context: Optional information about the current development work
        question: Optional specific question to ask

    Returns:
        A formatted prompt string
    """
    # Format the development context section if provided
    dev_context_section = ""
    if development_context:
        dev_context_section = f"""
DEVELOPMENT CONTEXT:
{development_context}
"""

    # Format the question section if provided
    question_section = ""
    if question:
        question_section = f"""
QUESTION:
{question}
"""

    # Fill in the template
    prompt = BASE_PROMPT_TEMPLATE.format(
        project_context=project_context,
        development_context=dev_context_section,
        question=question_section,
    )

    return prompt


def generate_technical_prompt(
    project_context: str,
    code_snippets: Optional[str] = None,
    error_message: Optional[str] = None,
    specific_task: Optional[str] = None,
) -> str:
    """
    Generate a prompt for technical problem-solving.

    Args:
        project_context: Information about the project
        code_snippets: Optional relevant code snippets
        error_message: Optional error message to troubleshoot
        specific_task: Optional specific technical task

    Returns:
        A formatted prompt string
    """
    prompt = f"""
You are an expert software developer helping with a technical problem. Here's the context:

PROJECT CONTEXT:
{project_context}
"""

    if code_snippets:
        prompt += f"""
RELEVANT CODE:
```
{code_snippets}
```
"""

    if error_message:
        prompt += f"""
ERROR MESSAGE:
```
{error_message}
```
"""

    if specific_task:
        prompt += f"""
TASK:
{specific_task}
"""

    prompt += """
Please provide a clear, technical solution to the problem. Include code examples where appropriate.
"""

    return prompt


def generate_brainstorming_prompt(
    project_context: str,
    current_ideas: Optional[str] = None,
    focus_area: Optional[str] = None,
) -> str:
    """
    Generate a prompt for creative brainstorming sessions.

    Args:
        project_context: Information about the project
        current_ideas: Optional list of ideas already considered
        focus_area: Optional specific area to focus brainstorming on

    Returns:
        A formatted prompt string
    """
    prompt = f"""
You are a creative consultant helping brainstorm ideas for a software project. Here's the context:

PROJECT CONTEXT:
{project_context}
"""

    if current_ideas:
        prompt += f"""
IDEAS ALREADY CONSIDERED:
{current_ideas}
"""

    if focus_area:
        prompt += f"""
FOCUS AREA:
{focus_area}
"""

    prompt += """
Please generate innovative, practical ideas for this project. For each idea, provide:
1. A concise name/title
2. A brief description of the concept
3. Key benefits or advantages
4. Potential implementation challenges
"""

    return prompt
