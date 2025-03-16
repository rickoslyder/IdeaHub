import express from "express";
import {
  createEmbeddings,
  findRelevantItems,
  createPrompt,
} from "../controllers/aiController.js";

const router = express.Router();

/**
 * @route   POST /api/ai/embeddings
 * @desc    Generate embeddings for texts
 * @access  Private
 */
router.post("/embeddings", createEmbeddings);

/**
 * @route   POST /api/ai/relevance
 * @desc    Find relevant items based on query and documents
 * @access  Private
 */
router.post("/relevance", findRelevantItems);

/**
 * @route   POST /api/ai/prompts
 * @desc    Generate a prompt for AI assistants
 * @access  Private
 */
router.post("/prompts", createPrompt);

export default router;
