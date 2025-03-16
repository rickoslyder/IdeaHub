import axios from "axios";
import { Project, Development } from "../models/index.js";
import {
  findSimilarDevelopmentsForProject,
  findSimilarProjectsForDevelopment,
  generateAndStoreDevelopmentEmbedding,
  generateAndStoreProjectEmbedding,
  generateEmbeddings,
} from "./embeddingService.js";
import {
  findRelatedProjects,
  findRelatedDevelopments,
} from "./searchService.js";

/**
 * Find projects relevant to a development
 * @param developmentId - ID of the development
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of relevant projects with similarity scores
 */
export const findRelevantProjects = async (
  developmentId: string,
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ project: Project; score: number }[]> => {
  try {
    // Get the development
    const development = await Development.findByPk(developmentId);
    if (!development) {
      throw new Error(`Development with ID ${developmentId} not found`);
    }

    // Generate embedding for the development
    const text = [development.content, ...development.tags].join(" ");
    const embeddings = await generateEmbeddings([text]);
    const embedding = embeddings[0];

    // Find related projects
    const relatedProjects = await findRelatedProjects(
      developmentId,
      embedding,
      topK,
      threshold
    );

    // Map results to projects
    const projects = await Promise.all(
      relatedProjects.map(
        async ({ entityId, score }: { entityId: string; score: number }) => {
          const project = await Project.findByPk(entityId);
          return project ? { project, score } : null;
        }
      )
    );

    // Filter out nulls (in case a project was deleted)
    return projects.filter(
      (result: any): result is { project: Project; score: number } =>
        result !== null
    );
  } catch (error) {
    console.error("Error finding relevant projects:", error);
    throw error;
  }
};

/**
 * Find developments relevant to a project
 * @param projectId - ID of the project
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of relevant developments with similarity scores
 */
export const findRelevantDevelopments = async (
  projectId: string,
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ development: Development; score: number }[]> => {
  try {
    // Get the project
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Generate embedding for the project
    const text = [
      project.name,
      project.description || "",
      project.documentation || "",
      ...project.tags,
    ].join(" ");
    const embeddings = await generateEmbeddings([text]);
    const embedding = embeddings[0];

    // Find related developments
    const relatedDevelopments = await findRelatedDevelopments(
      projectId,
      embedding,
      topK,
      threshold
    );

    // Map results to developments
    const developments = await Promise.all(
      relatedDevelopments.map(
        async ({ entityId, score }: { entityId: string; score: number }) => {
          const development = await Development.findByPk(entityId);
          return development ? { development, score } : null;
        }
      )
    );

    // Filter out nulls (in case a development was deleted)
    return developments.filter(
      (result: any): result is { development: Development; score: number } =>
        result !== null
    );
  } catch (error) {
    console.error("Error finding relevant developments:", error);
    throw error;
  }
};

/**
 * Generate suggestions for how to apply a development to a project
 * @param projectId - ID of the project
 * @param developmentId - ID of the development
 * @returns Suggestion text
 */
export async function generateSuggestion(
  projectId: string,
  developmentId: string
): Promise<string> {
  try {
    const project = await Project.findByPk(projectId);
    const development = await Development.findByPk(developmentId);

    if (!project || !development) {
      throw new Error("Project or development not found");
    }

    // Simple template for suggestion
    const suggestion = `
Based on the ${development.type} "${development.title}" that you've tracked, 
here are some ways you might apply it to your "${project.name}" project:

1. **Explore Integration**: Consider how ${development.title} could enhance or solve challenges in your project.
   ${getExplorationPrompt(development.type)}

2. **Update Documentation**: Add notes about ${development.title} to your project documentation.
   This will help you remember this option for future reference.

3. **Research More**: Look for examples of how others have used ${development.title} in similar contexts.
   ${development.sourceUrl ? `The source at ${development.sourceUrl} might be a good starting point.` : ""}

4. **Experiment**: Create a small proof of concept to test how ${development.title} might work in your project context.
   This can help evaluate benefits before deeper integration.
`;

    return suggestion;
  } catch (error) {
    console.error("Error generating suggestion:", error);
    throw error;
  }
}

/**
 * Find relevant developments for a project
 */
export async function findRelevantDevelopmentsForProject(
  projectId: string,
  limit = 5
): Promise<{
  developments: Development[];
  scores: number[];
}> {
  try {
    const project = await Project.findByPk(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Ensure project has embedding
    await generateAndStoreProjectEmbedding(project);

    // Find similar development IDs
    const developmentIds = await findSimilarDevelopmentsForProject(
      project,
      limit,
      0.6 // Lower threshold to show more results
    );

    if (developmentIds.length === 0) {
      return { developments: [], scores: [] };
    }

    // Fetch full development objects
    const developments = await Development.findAll({
      where: {
        id: developmentIds,
      },
    });

    // Return in the same order as the search results
    const orderedDevelopments = developmentIds
      .map((id: string) =>
        developments.find((dev: Development) => dev.id === id)
      )
      .filter(
        (dev: Development | undefined): dev is Development => dev !== undefined
      );

    // Mock scores for now - would come from actual embedding similarity
    const scores = orderedDevelopments.map(
      (_, index) => Math.round((0.95 - index * 0.05) * 100) / 100
    );

    return {
      developments: orderedDevelopments,
      scores,
    };
  } catch (error) {
    console.error("Error finding relevant developments:", error);
    throw error;
  }
}

/**
 * Find relevant projects for a development
 */
export async function findRelevantProjectsForDevelopment(
  developmentId: string,
  limit = 5
): Promise<{
  projects: Project[];
  scores: number[];
}> {
  try {
    const development = await Development.findByPk(developmentId);

    if (!development) {
      throw new Error("Development not found");
    }

    // Ensure development has embedding
    await generateAndStoreDevelopmentEmbedding(development);

    // Find similar project IDs
    const projectIds = await findSimilarProjectsForDevelopment(
      development,
      limit,
      0.6 // Lower threshold to show more results
    );

    if (projectIds.length === 0) {
      return { projects: [], scores: [] };
    }

    // Fetch full project objects
    const projects = await Project.findAll({
      where: {
        id: projectIds,
      },
    });

    // Return in the same order as the search results
    const orderedProjects = projectIds
      .map((id) => projects.find((proj) => proj.id === id))
      .filter((proj) => proj !== undefined) as Project[];

    // Mock scores for now - would come from actual embedding similarity
    const scores = orderedProjects.map(
      (_, index) => Math.round((0.95 - index * 0.05) * 100) / 100
    );

    return {
      projects: orderedProjects,
      scores,
    };
  } catch (error) {
    console.error("Error finding relevant projects:", error);
    throw error;
  }
}

/**
 * Helper function to get exploration prompts based on development type
 */
function getExplorationPrompt(type: string): string {
  switch (type.toUpperCase()) {
    case "LIBRARY":
      return "Consider if this library offers features that could simplify parts of your codebase or add new capabilities.";

    case "FRAMEWORK":
      return "Evaluate if transitioning to this framework (or incorporating parts of it) would benefit your project architecture.";

    case "TOOL":
      return "Determine if adding this tool to your workflow could improve productivity or solve specific pain points.";

    case "TECHNIQUE":
      return "Identify areas where this technique could improve performance, readability, or maintainability.";

    case "API":
      return "Explore if integrating with this API would add valuable functionality or data to your project.";

    case "CONCEPT":
      return "Consider how this concept might influence your overall approach or design decisions.";

    case "ARTICLE":
      return "Review the key ideas and see which aspects might apply to your specific context.";

    default:
      return "Think about how the core concepts could be applied or adapted to your specific needs.";
  }
}
