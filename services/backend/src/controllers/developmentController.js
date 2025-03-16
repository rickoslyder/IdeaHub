import { Development } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

// Get all developments
export const getAllDevelopments = async (req, res) => {
  try {
    const developments = await Development.findAll();
    return res.status(200).json({
      success: true,
      data: developments,
    });
  } catch (error) {
    console.error("Error fetching developments:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch developments",
    });
  }
};

// Get a single development by ID
export const getDevelopmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const development = await Development.findByPk(id);

    if (!development) {
      return res.status(404).json({
        success: false,
        error: "Development not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: development,
    });
  } catch (error) {
    console.error("Error fetching development:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch development",
    });
  }
};

// Create a new development
export const createDevelopment = async (req, res) => {
  try {
    const { title, content, type, source, sourceUrl, tags } = req.body;

    // Basic validation
    if (!title || !content || !type) {
      return res.status(400).json({
        success: false,
        error: "Title, content, and type are required",
      });
    }

    // For now, we'll hardcode the userId until we implement authentication
    const userId = "00000000-0000-0000-0000-000000000000";

    const development = await Development.create({
      id: uuidv4(),
      userId,
      title,
      content,
      type,
      source,
      sourceUrl,
      tags: tags || [],
    });

    return res.status(201).json({
      success: true,
      data: development,
    });
  } catch (error) {
    console.error("Error creating development:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create development",
    });
  }
};

// Update a development
export const updateDevelopment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, source, sourceUrl, tags } = req.body;

    const development = await Development.findByPk(id);

    if (!development) {
      return res.status(404).json({
        success: false,
        error: "Development not found",
      });
    }

    // Update development fields
    await development.update({
      title: title || development.title,
      content: content || development.content,
      type: type || development.type,
      source: source !== undefined ? source : development.source,
      sourceUrl: sourceUrl !== undefined ? sourceUrl : development.sourceUrl,
      tags: tags || development.tags,
    });

    return res.status(200).json({
      success: true,
      data: development,
    });
  } catch (error) {
    console.error("Error updating development:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update development",
    });
  }
};

// Delete a development
export const deleteDevelopment = async (req, res) => {
  try {
    const { id } = req.params;
    const development = await Development.findByPk(id);

    if (!development) {
      return res.status(404).json({
        success: false,
        error: "Development not found",
      });
    }

    await development.destroy();

    return res.status(200).json({
      success: true,
      message: "Development deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting development:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete development",
    });
  }
};
