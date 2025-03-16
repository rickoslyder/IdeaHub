import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Generate embeddings for texts
 * @param {Array<string>} texts - Array of texts to generate embeddings for
 * @param {string} model - Model to use for embedding (optional)
 * @returns {Promise<Array<Array<number>>>} - Array of embedding vectors
 */
const generateEmbeddings = async (texts, model = "all-MiniLM-L6-v2") => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/embeddings`, {
      texts,
      model,
    });

    return response.data.embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error.message);
    throw new Error("Failed to generate embeddings");
  }
};

/**
 * Compute relevance between a query and documents
 * @param {string} query - The query text
 * @param {Array<string>} documents - Array of document texts to compare against
 * @param {string} model - Model to use for embeddings (optional)
 * @returns {Promise<Array<Object>>} - Ranked results with similarity scores
 */
const computeRelevance = async (
  query,
  documents,
  model = "all-MiniLM-L6-v2"
) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/relevance`, {
      query,
      documents,
      model,
    });

    return response.data.results;
  } catch (error) {
    console.error("Error computing relevance:", error.message);
    throw new Error("Failed to compute relevance");
  }
};

/**
 * Generate a general prompt for AI assistants
 * @param {string} projectContext - Context about the project
 * @param {string} developmentContext - Context about the development work (optional)
 * @param {string} question - Specific question to ask (optional)
 * @returns {Promise<string>} - Formatted prompt
 */
const generatePrompt = async (projectContext, developmentContext, question) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/prompts/general`, {
      project_context: projectContext,
      development_context: developmentContext,
      question,
    });

    return response.data.prompt;
  } catch (error) {
    console.error("Error generating prompt:", error.message);
    throw new Error("Failed to generate prompt");
  }
};

// API endpoint to generate embeddings
export const createEmbeddings = async (req, res) => {
  try {
    const { texts, model } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request: texts must be a non-empty array",
      });
    }

    const embeddings = await generateEmbeddings(texts, model);

    return res.status(200).json({
      success: true,
      data: {
        embeddings,
        model: model || "all-MiniLM-L6-v2",
      },
    });
  } catch (error) {
    console.error("Error in createEmbeddings controller:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate embeddings",
    });
  }
};

// API endpoint to compute relevance
export const findRelevantItems = async (req, res) => {
  try {
    const { query, documents, model } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request: query must be a non-empty string",
      });
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request: documents must be a non-empty array",
      });
    }

    const results = await computeRelevance(query, documents, model);

    return res.status(200).json({
      success: true,
      data: {
        results,
        model: model || "all-MiniLM-L6-v2",
      },
    });
  } catch (error) {
    console.error("Error in findRelevantItems controller:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to compute relevance",
    });
  }
};

// API endpoint to generate prompts
export const createPrompt = async (req, res) => {
  try {
    const { project_context, development_context, question } = req.body;

    if (!project_context || typeof project_context !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request: project_context must be a non-empty string",
      });
    }

    const prompt = await generatePrompt(
      project_context,
      development_context,
      question
    );

    return res.status(200).json({
      success: true,
      data: {
        prompt,
      },
    });
  } catch (error) {
    console.error("Error in createPrompt controller:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate prompt",
    });
  }
};
