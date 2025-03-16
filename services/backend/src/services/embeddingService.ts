import axios from "axios";
import dotenv from "dotenv";
import { Project, Development } from "../models/index.js";
import {
  insertEmbedding,
  PROJECT_COLLECTION,
  DEVELOPMENT_COLLECTION,
} from "./milvusService.js";
import { v4 as uuidv4 } from "uuid";
import { milvusClient } from "./milvusService.js";

// Load environment variables
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Collection names in Milvus
const DEVELOPMENTS_COLLECTION = "development_embeddings";
const PROJECTS_COLLECTION = "project_embeddings";

// Dimension of the embeddings (depends on the model used)
const EMBEDDING_DIMENSION = 768; // E5/BGE models typically use 768 dimensions

/**
 * Initialize Milvus collections for projects and developments
 */
export async function initializeEmbeddingCollections(): Promise<void> {
  try {
    // Check and create developments collection if it doesn't exist
    const hasDevelopmentsCollection = await milvusClient.hasCollection({
      collection_name: DEVELOPMENTS_COLLECTION,
    });

    if (!hasDevelopmentsCollection) {
      await milvusClient.createCollection({
        collection_name: DEVELOPMENTS_COLLECTION,
        fields: [
          {
            name: "id",
            data_type: "VarChar",
            is_primary_key: true,
            max_length: 36,
          },
          {
            name: "development_id",
            data_type: "VarChar",
            max_length: 36,
          },
          {
            name: "embedding",
            data_type: "FloatVector",
            dim: EMBEDDING_DIMENSION,
          },
        ],
      });

      // Create index for fast vector search
      await milvusClient.createIndex({
        collection_name: DEVELOPMENTS_COLLECTION,
        field_name: "embedding",
        index_type: "IVF_FLAT",
        metric_type: "COSINE",
        params: { nlist: 1024 },
      });

      console.log("Created developments embeddings collection");
    }

    // Check and create projects collection if it doesn't exist
    const hasProjectsCollection = await milvusClient.hasCollection({
      collection_name: PROJECTS_COLLECTION,
    });

    if (!hasProjectsCollection) {
      await milvusClient.createCollection({
        collection_name: PROJECTS_COLLECTION,
        fields: [
          {
            name: "id",
            data_type: "VarChar",
            is_primary_key: true,
            max_length: 36,
          },
          {
            name: "project_id",
            data_type: "VarChar",
            max_length: 36,
          },
          {
            name: "embedding",
            data_type: "FloatVector",
            dim: EMBEDDING_DIMENSION,
          },
        ],
      });

      // Create index for fast vector search
      await milvusClient.createIndex({
        collection_name: PROJECTS_COLLECTION,
        field_name: "embedding",
        index_type: "IVF_FLAT",
        metric_type: "COSINE",
        params: { nlist: 1024 },
      });

      console.log("Created projects embeddings collection");
    }
  } catch (error) {
    console.error("Error initializing embedding collections:", error);
    throw error;
  }
}

/**
 * Generate embeddings for a list of text inputs
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Call AI service to generate embeddings
    const response = await axios.post(
      process.env.AI_SERVICE_URL + "/embeddings",
      { texts }
    );

    return response.data.embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}

/**
 * Generate and store embeddings for a development
 */
export async function generateAndStoreDevelopmentEmbedding(
  development: Development
): Promise<void> {
  try {
    // Combine development content for embedding
    const textToEmbed = `${development.title || ""} ${development.content || ""} ${development.tags?.join(" ") || ""}`;

    // Generate embedding
    const embeddings = await generateEmbeddings([textToEmbed]);
    const embedding = embeddings[0];

    // Delete existing embedding if any
    await deleteDevelopmentEmbedding(development.id);

    // Store in Milvus
    await milvusClient.insert({
      collection_name: DEVELOPMENTS_COLLECTION,
      fields_data: [
        {
          id: uuidv4(),
          development_id: development.id,
          embedding,
        },
      ],
    });

    console.log(`Stored embedding for development ${development.id}`);
  } catch (error) {
    console.error("Error storing development embedding:", error);
    throw error;
  }
}

/**
 * Generate and store embeddings for a project
 */
export async function generateAndStoreProjectEmbedding(
  project: Project
): Promise<void> {
  try {
    // Combine project information for embedding
    const textToEmbed = `${project.name || ""} ${project.description || ""} ${project.tags?.join(" ") || ""}`;

    // Generate embedding
    const embeddings = await generateEmbeddings([textToEmbed]);
    const embedding = embeddings[0];

    // Delete existing embedding if any
    await deleteProjectEmbedding(project.id);

    // Store in Milvus
    await milvusClient.insert({
      collection_name: PROJECTS_COLLECTION,
      fields_data: [
        {
          id: uuidv4(),
          project_id: project.id,
          embedding,
        },
      ],
    });

    console.log(`Stored embedding for project ${project.id}`);
  } catch (error) {
    console.error("Error storing project embedding:", error);
    throw error;
  }
}

/**
 * Delete an embedding for a development
 */
export async function deleteDevelopmentEmbedding(
  developmentId: string
): Promise<void> {
  try {
    await milvusClient.deleteEntities({
      collection_name: DEVELOPMENTS_COLLECTION,
      filter: `development_id == "${developmentId}"`,
    });

    console.log(`Deleted embedding for development ${developmentId}`);
  } catch (error) {
    console.error("Error deleting development embedding:", error);
    throw error;
  }
}

/**
 * Delete an embedding for a project
 */
export async function deleteProjectEmbedding(projectId: string): Promise<void> {
  try {
    await milvusClient.deleteEntities({
      collection_name: PROJECTS_COLLECTION,
      filter: `project_id == "${projectId}"`,
    });

    console.log(`Deleted embedding for project ${projectId}`);
  } catch (error) {
    console.error("Error deleting project embedding:", error);
    throw error;
  }
}

/**
 * Find similar developments for a project
 */
export async function findSimilarDevelopmentsForProject(
  project: Project,
  limit = 5,
  threshold = 0.7
): Promise<string[]> {
  try {
    // Combine project information for embedding
    const textToEmbed = `${project.name || ""} ${project.description || ""} ${project.tags?.join(" ") || ""}`;

    // Generate embedding
    const embeddings = await generateEmbeddings([textToEmbed]);
    const embedding = embeddings[0];

    // Search in Milvus
    const results = await milvusClient.search({
      collection_name: DEVELOPMENTS_COLLECTION,
      vectors: [embedding],
      search_params: {
        anns_field: "embedding",
        metric_type: "COSINE",
        params: JSON.stringify({ nprobe: 10 }),
        topk: limit,
      },
      output_fields: ["development_id"],
    });

    // Filter by threshold and extract IDs
    return results.results
      .filter((result: any) => result.score >= threshold)
      .map((result: any) => result.entity.development_id);
  } catch (error) {
    console.error("Error finding similar developments:", error);
    throw error;
  }
}

/**
 * Find similar projects for a development
 */
export async function findSimilarProjectsForDevelopment(
  development: Development,
  limit = 5,
  threshold = 0.7
): Promise<string[]> {
  try {
    // Combine development content for embedding
    const textToEmbed = `${development.title || ""} ${development.content || ""} ${development.tags?.join(" ") || ""}`;

    // Generate embedding
    const embeddings = await generateEmbeddings([textToEmbed]);
    const embedding = embeddings[0];

    // Search in Milvus
    const results = await milvusClient.search({
      collection_name: PROJECTS_COLLECTION,
      vectors: [embedding],
      search_params: {
        anns_field: "embedding",
        metric_type: "COSINE",
        params: JSON.stringify({ nprobe: 10 }),
        topk: limit,
      },
      output_fields: ["project_id"],
    });

    // Filter by threshold and extract IDs
    return results.results
      .filter((result: any) => result.score >= threshold)
      .map((result: any) => result.entity.project_id);
  } catch (error) {
    console.error("Error finding similar projects:", error);
    throw error;
  }
}
