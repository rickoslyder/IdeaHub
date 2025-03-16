import folderSyncService from "../services/folderSyncService.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Project } from "../models/Project.js";

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Sync controller
export const folderSyncController = {
  /**
   * Process folder sync changes
   */
  processChanges: async (req, res) => {
    try {
      const { projectId } = req.body;
      const files = req.files || [];
      const fileChangesJson = req.body.fileChanges || "[]";

      // Validate project ID
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      // Check if project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Parse the file changes
      let fileChanges;
      try {
        fileChanges = JSON.parse(fileChangesJson);
        if (!Array.isArray(fileChanges)) {
          fileChanges = [fileChanges]; // Handle single object
        }
      } catch (error) {
        return res.status(400).json({
          error: "Invalid file changes format",
          details: error.message,
        });
      }

      // Process each file change
      const changes = [];

      for (const change of fileChanges) {
        const { type, path: relativePath } = change;

        // Find matching file in the uploaded files
        const file = files.find((f) => f.originalname === relativePath);

        // Add to changes array
        changes.push({
          type,
          relativePath,
          content: file ? file.buffer.toString("utf-8") : undefined,
          isDirectory: type === "addDir" || type === "unlinkDir",
        });
      }

      // Send to service for processing
      const result = await folderSyncService.processChanges({
        projectId,
        changes,
      });

      return res.json(result);
    } catch (error) {
      console.error("Error processing folder sync:", error);
      return res.status(500).json({
        error: "Failed to process folder sync",
        details: error.message,
      });
    }
  },

  /**
   * Get file contents from a project
   */
  getFile: async (req, res) => {
    try {
      const { projectId, filePath } = req.params;

      // Validate parameters
      if (!projectId || !filePath) {
        return res
          .status(400)
          .json({ error: "Project ID and file path are required" });
      }

      // Check if project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get file content from service
      const fileContent = await folderSyncService.getFileContent(
        projectId,
        filePath
      );

      // Set proper content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = getContentType(ext);

      res.setHeader("Content-Type", contentType);
      return res.send(fileContent);
    } catch (error) {
      console.error("Error getting file:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: "File not found" });
      }

      return res.status(500).json({
        error: "Failed to get file",
        details: error.message,
      });
    }
  },

  /**
   * List files in a project directory
   */
  listFiles: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { directory = "" } = req.query;

      // Validate parameters
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      // Check if project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get file list from service
      const files = await folderSyncService.listFiles(projectId, directory);

      return res.json(files);
    } catch (error) {
      console.error("Error listing files:", error);
      return res.status(500).json({
        error: "Failed to list files",
        details: error.message,
      });
    }
  },
};

/**
 * Get content type based on file extension
 */
function getContentType(extension) {
  const contentTypes = {
    ".txt": "text/plain",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".md": "text/markdown",
    ".ts": "application/typescript",
    ".tsx": "application/typescript",
    ".jsx": "application/javascript",
  };

  return contentTypes[extension] || "application/octet-stream";
}

export default folderSyncController;
