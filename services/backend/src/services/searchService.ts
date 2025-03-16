import {
  PROJECT_COLLECTION,
  DEVELOPMENT_COLLECTION,
  searchSimilar,
} from "./milvusService.js";
import { Development, Project } from "../models/index.js";
import { milvusClient } from "./milvusService.js";
import { DataType } from "@zilliz/milvus2-sdk-node";

// Define types for search results
export interface SearchResult {
  id: string;
  type: "project" | "development";
  score: number;
}

/**
 * Search for projects and developments related to a query embedding
 * @param queryEmbedding - The vector embedding of the query text
 * @param topK - Maximum number of results per collection
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of search results sorted by relevance
 */
export const searchAll = async (
  queryEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> => {
  try {
    // Search projects
    const projectResults = await searchSimilar(
      PROJECT_COLLECTION,
      queryEmbedding,
      topK,
      threshold
    );

    // Search developments
    const developmentResults = await searchSimilar(
      DEVELOPMENT_COLLECTION,
      queryEmbedding,
      topK,
      threshold
    );

    // Combine and format results
    const results: SearchResult[] = [
      ...projectResults.map((result: { entityId: string; score: number }) => ({
        id: result.entityId,
        type: "project" as const,
        score: result.score,
      })),
      ...developmentResults.map(
        (result: { entityId: string; score: number }) => ({
          id: result.entityId,
          type: "development" as const,
          score: result.score,
        })
      ),
    ];

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
};

/**
 * Search for projects similar to a query embedding
 * @param queryEmbedding - The vector embedding of the query text
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of project IDs with similarity scores
 */
export const searchProjects = async (
  queryEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ entityId: string; score: number }[]> => {
  try {
    return await searchSimilar(
      PROJECT_COLLECTION,
      queryEmbedding,
      topK,
      threshold
    );
  } catch (error) {
    console.error("Error searching projects:", error);
    throw error;
  }
};

/**
 * Search for developments similar to a query embedding
 * @param queryEmbedding - The vector embedding of the query text
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of development IDs with similarity scores
 */
export const searchDevelopments = async (
  queryEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ entityId: string; score: number }[]> => {
  try {
    return await searchSimilar(
      DEVELOPMENT_COLLECTION,
      queryEmbedding,
      topK,
      threshold
    );
  } catch (error) {
    console.error("Error searching developments:", error);
    throw error;
  }
};

/**
 * Find projects related to a development
 * @param developmentId - ID of the development
 * @param developmentEmbedding - Embedding of the development
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of project IDs with similarity scores
 */
export const findRelatedProjects = async (
  developmentId: string,
  developmentEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ entityId: string; score: number }[]> => {
  return await searchProjects(developmentEmbedding, topK, threshold);
};

/**
 * Find developments related to a project
 * @param projectId - ID of the project
 * @param projectEmbedding - Embedding of the project
 * @param topK - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of development IDs with similarity scores
 */
export const findRelatedDevelopments = async (
  projectId: string,
  projectEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ entityId: string; score: number }[]> => {
  return await searchDevelopments(projectEmbedding, topK, threshold);
};

// Collection names for Milvus
const DEVELOPMENTS_COLLECTION = "developments";
const PROJECTS_COLLECTION = "projects";

// Helper function to perform vector search in Milvus
async function performVectorSearch(
  collection: string,
  queryEmbedding: number[],
  topK: number = 5,
  scoreThreshold: number = 0.75
): Promise<{ entityId: string; score: number }[]> {
  try {
    const searchResults = await searchSimilar(collection, queryEmbedding, topK);

    // Filter results by score threshold
    return searchResults.filter((result) => result.score >= scoreThreshold);
  } catch (error) {
    console.error(
      `Error in vector search for collection ${collection}:`,
      error
    );
    return [];
  }
}

/**
 * Simple text search for developments by query text
 * @param query - Search query
 * @param limit - Maximum number of results
 * @returns Array of matching developments
 */
export async function textSearchDevelopments(
  query: string,
  limit: number = 10
): Promise<Development[]> {
  const lowerQuery = query.toLowerCase();

  // Find developments matching the query in title, description or tags
  return Development.findAll({
    where: {},
    limit,
  }).then((developments) => {
    // Filter in memory - in a real app, this would use a proper full-text search
    return developments.filter((dev) => {
      const title = dev.title.toLowerCase();
      const content = (dev.content || "").toLowerCase();
      const tags = dev.tags.map((tag) => tag.toLowerCase());

      return (
        title.includes(lowerQuery) ||
        content.includes(lowerQuery) ||
        tags.some((tag) => tag.includes(lowerQuery))
      );
    });
  });
}

/**
 * Simple text search for projects by query text
 * @param query - Search query
 * @param limit - Maximum number of results
 * @returns Array of matching projects
 */
export async function textSearchProjects(
  query: string,
  limit: number = 10
): Promise<Project[]> {
  const lowerQuery = query.toLowerCase();

  // Find projects matching the query in name, description or tags
  return Project.findAll({
    where: {},
    limit,
  }).then((projects) => {
    // Filter in memory - in a real app, this would use a proper full-text search
    return projects.filter((project) => {
      const name = project.name.toLowerCase();
      const description = (project.description || "").toLowerCase();
      const tags = project.tags.map((tag) => tag.toLowerCase());

      return (
        name.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        tags.some((tag) => tag.includes(lowerQuery))
      );
    });
  });
}
