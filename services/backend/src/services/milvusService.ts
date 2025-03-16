import { MilvusClient, DataType, ClientConfig } from "@zilliz/milvus2-sdk-node";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define constants for vector dimensions and collection names
const VECTOR_DIM = 768; // For E5/BGE models
const PROJECT_COLLECTION = "ProjectsEmbeddings";
const DEVELOPMENT_COLLECTION = "DevelopmentsEmbeddings";

// Initialize the Milvus client with Zilliz Cloud config
const clientConfig: ClientConfig = {
  address: process.env.ZILLIZ_ENDPOINT || "",
  token: process.env.ZILLIZ_API_KEY || "",
  ssl: true,
  // Enable for debugging
  // logLevel: 'debug',
};

const milvusClient = new MilvusClient(clientConfig);

/**
 * Create a collection for storing vector embeddings if it doesn't exist
 * @param collectionName - Name of the collection to create
 */
const createCollection = async (collectionName: string): Promise<void> => {
  try {
    // Check if collection exists
    const hasCollectionRes = await milvusClient.hasCollection({
      collection_name: collectionName,
    });

    if (!hasCollectionRes.value) {
      console.log(`Creating collection: ${collectionName}`);

      // Create the collection
      await milvusClient.createCollection({
        collection_name: collectionName,
        fields: [
          {
            name: "id",
            description: "ID field",
            data_type: DataType.VarChar,
            is_primary_key: true,
            max_length: 36,
          },
          {
            name: "entity_id",
            description: "Entity ID from database",
            data_type: DataType.VarChar,
            max_length: 36,
          },
          {
            name: "embedding",
            description: "Vector embedding",
            data_type: DataType.FloatVector,
            dim: VECTOR_DIM,
          },
        ],
      });

      // Create an index for vector similarity search
      await milvusClient.createIndex({
        collection_name: collectionName,
        field_name: "embedding",
        index_name: `${collectionName}_index`,
        index_type: "FLAT", // Basic index type for cosine similarity
        metric_type: "COSINE", // Cosine similarity for semantic matching
        params: {},
      });

      console.log(`Collection ${collectionName} created successfully`);
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Insert vector embeddings into a collection
 * @param collectionName - Name of the collection
 * @param id - Primary key for the record
 * @param entityId - ID of the entity (project or development) in the database
 * @param embedding - Vector embedding
 */
const insertEmbedding = async (
  collectionName: string,
  id: string,
  entityId: string,
  embedding: number[]
): Promise<void> => {
  try {
    // Make sure collection is loaded
    await milvusClient.loadCollection({
      collection_name: collectionName,
    });

    // Insert the embedding
    await milvusClient.insert({
      collection_name: collectionName,
      fields_data: [
        {
          id,
          entity_id: entityId,
          embedding,
        },
      ],
    });
    console.log(`Embedding for ${entityId} inserted into ${collectionName}`);
  } catch (error) {
    console.error(`Error inserting embedding into ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Search for similar vectors in a collection
 * @param collectionName - Name of the collection
 * @param embedding - Query vector embedding
 * @param topK - Number of results to return
 * @param threshold - Similarity threshold (0-1)
 */
const searchSimilar = async (
  collectionName: string,
  embedding: number[],
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ entityId: string; score: number }[]> => {
  try {
    // Load the collection
    await milvusClient.loadCollection({
      collection_name: collectionName,
    });

    // Search for similar vectors
    const searchResult = await milvusClient.search({
      collection_name: collectionName,
      vectors: [embedding],
      search_params: {
        anns_field: "embedding",
        topk: topK,
        metric_type: "COSINE",
        params: JSON.stringify({}),
      },
      vector_type: DataType.FloatVector,
      output_fields: ["entity_id"],
    });

    if (!searchResult.results || searchResult.results.length === 0) {
      return [];
    }

    // Process results
    const results = searchResult.results.map((result) => ({
      entityId: result.entity_id as string,
      score: result.score,
    }));

    // Filter by threshold
    return results.filter((result) => result.score >= threshold);
  } catch (error) {
    console.error(`Error searching in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete embeddings for an entity from a collection
 * @param collectionName - Name of the collection
 * @param entityId - ID of the entity in the database
 */
const deleteEmbeddings = async (
  collectionName: string,
  entityId: string
): Promise<void> => {
  try {
    await milvusClient.loadCollection({
      collection_name: collectionName,
    });

    // Query to find records by entity_id
    const queryResult = await milvusClient.query({
      collection_name: collectionName,
      filter: `entity_id == "${entityId}"`,
      output_fields: ["id"],
    });

    if (queryResult.data && queryResult.data.length > 0) {
      // Extract IDs
      const ids = queryResult.data.map((item) => item.id);

      // Delete the records
      await milvusClient.delete({
        collection_name: collectionName,
        filter: `id in [${ids.map((id: string) => `"${id}"`).join(",")}]`,
      });

      console.log(
        `Deleted embeddings for entity ${entityId} from ${collectionName}`
      );
    } else {
      console.log(
        `No embeddings found for entity ${entityId} in ${collectionName}`
      );
    }
  } catch (error) {
    console.error(`Error deleting embeddings from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Initialize both collections
 */
const initializeCollections = async (): Promise<void> => {
  await createCollection(PROJECT_COLLECTION);
  await createCollection(DEVELOPMENT_COLLECTION);
};

/**
 * Test connection to Milvus/Zilliz server
 */
const testConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing connection to Zilliz Cloud...");
    // Use listCollections as a way to test connectivity
    const response = await milvusClient.listCollections();
    console.log(
      `Connected to Zilliz Cloud. Available collections: ${response.data.map((c) => c.name).join(", ")}`
    );
    return true;
  } catch (error) {
    console.error("Failed to connect to Zilliz Cloud:", error);
    return false;
  }
};

export {
  milvusClient,
  createCollection,
  insertEmbedding,
  searchSimilar,
  deleteEmbeddings,
  initializeCollections,
  testConnection,
  PROJECT_COLLECTION,
  DEVELOPMENT_COLLECTION,
  VECTOR_DIM,
};
