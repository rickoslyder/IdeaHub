import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Project } from "../models/Project.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
/**
 * @typedef {Object} FileChange
 * @property {string} type - The type of change (add, change, unlink)
 * @property {string} relativePath - The path relative to the project root
 * @property {string} [content] - The file content (for add/change)
 * @property {boolean} isDirectory - Whether this is a directory
 */

/**
 * @typedef {Object} FolderSyncPayload
 * @property {string} projectId - The project ID
 * @property {FileChange[]} changes - Array of file changes
 */

/**
 * @typedef {Object} FolderSyncConfig
 * @property {string} basePath - Base directory for storing project files
 * @property {number} maxFileSizeBytes - Maximum file size to store
 */

// Service for folder synchronization
export class FolderSyncService {
  /**
   * @type {FolderSyncConfig}
   */
  #config;

  /**
   * Create a new FolderSyncService
   * @param {FolderSyncConfig} config
   */
  constructor(config) {
    this.#config = {
      ...config,
      // Default config
      basePath:
        config.basePath || path.join(__dirname, "../../../storage/projects"),
      maxFileSizeBytes: config.maxFileSizeBytes || 5 * 1024 * 1024, // 5MB
    };

    // Ensure base storage directory exists
    this.ensureDirectory(this.#config.basePath);
  }

  /**
   * Ensure a directory exists
   * @param {string} dirPath - Directory path
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Process file changes for a project
   * @param {FolderSyncPayload} payload - Folder sync payload
   * @returns {Promise<{success: boolean, processed: number, failed: number, errors: string[]}>}
   */
  async processChanges(payload) {
    const { projectId, changes } = payload;
    const errors = [];
    let processed = 0;
    let failed = 0;

    try {
      // Verify project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Ensure project directory exists
      const projectDir = path.join(this.#config.basePath, projectId);
      await this.ensureDirectory(projectDir);

      // Process each change
      for (const change of changes) {
        try {
          await this.processChange(projectId, change);
          processed++;
        } catch (error) {
          console.error(
            `Error processing change for ${change.relativePath}:`,
            error
          );
          failed++;
          errors.push(
            `Failed to process ${change.relativePath}: ${error.message}`
          );
        }
      }

      // Update project's lastSynced field if it exists
      if (project.lastSynced !== undefined) {
        await project.update({ lastSynced: new Date() });
      }

      return { success: true, processed, failed, errors };
    } catch (error) {
      console.error(
        `Error processing changes for project ${projectId}:`,
        error
      );
      return {
        success: false,
        processed,
        failed: changes.length - processed,
        errors: [error.message],
      };
    }
  }

  /**
   * Process a single file change
   * @param {string} projectId - Project ID
   * @param {FileChange} change - File change
   */
  async processChange(projectId, change) {
    const { type, relativePath, content, isDirectory } = change;
    const fullPath = path.join(this.#config.basePath, projectId, relativePath);

    switch (type) {
      case "add":
      case "addDir":
        if (isDirectory) {
          await this.ensureDirectory(fullPath);
        } else {
          // Ensure parent directory exists
          const parentDir = path.dirname(fullPath);
          await this.ensureDirectory(parentDir);

          // Write file
          await fs.promises.writeFile(fullPath, content || "");
        }
        break;

      case "change":
        if (!isDirectory) {
          // Write file (overwrite)
          await fs.promises.writeFile(fullPath, content || "");
        }
        break;

      case "unlink":
      case "unlinkDir":
        // Check if path exists
        try {
          const stats = await fs.promises.stat(fullPath);

          if (stats.isDirectory()) {
            // Remove directory recursively
            await fs.promises.rm(fullPath, { recursive: true, force: true });
          } else {
            // Remove file
            await fs.promises.unlink(fullPath);
          }
        } catch (error) {
          // Ignore if not exists
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
        break;

      default:
        throw new Error(`Unknown change type: ${type}`);
    }
  }

  /**
   * Get file content from a project
   * @param {string} projectId - Project ID
   * @param {string} filePath - File path relative to project root
   * @returns {Promise<Buffer>} File content
   */
  async getFileContent(projectId, filePath) {
    // Sanitize file path to prevent directory traversal
    const sanitizedPath = path
      .normalize(filePath)
      .replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(this.#config.basePath, projectId, sanitizedPath);

    try {
      // Check if file exists
      const stats = await fs.promises.stat(fullPath);

      if (stats.isDirectory()) {
        throw new Error("Cannot get content of a directory");
      }

      // Check file size
      if (stats.size > this.#config.maxFileSizeBytes) {
        throw new Error(
          `File size exceeds maximum allowed (${this.#config.maxFileSizeBytes} bytes)`
        );
      }

      // Read file
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`File ${filePath} not found`);
      }
      throw error;
    }
  }

  /**
   * List files in a project directory
   * @param {string} projectId - Project ID
   * @param {string} directory - Directory relative to project root
   * @returns {Promise<Array<{name: string, path: string, type: string, size: number}>>}
   */
  async listFiles(projectId, directory = "") {
    // Sanitize directory path to prevent directory traversal
    const sanitizedDir = path
      .normalize(directory)
      .replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(this.#config.basePath, projectId, sanitizedDir);

    try {
      // Check if directory exists
      const stats = await fs.promises.stat(fullPath);

      if (!stats.isDirectory()) {
        throw new Error("Path is not a directory");
      }

      // Read directory
      const files = await fs.promises.readdir(fullPath);

      // Get file info
      const filePromises = files.map(async (file) => {
        const filePath = path.join(fullPath, file);
        const fileStats = await fs.promises.stat(filePath);

        return {
          name: file,
          path: path.join(sanitizedDir, file),
          type: fileStats.isDirectory() ? "directory" : "file",
          size: fileStats.size,
          modified: fileStats.mtime,
        };
      });

      return await Promise.all(filePromises);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`Directory ${directory} not found`);
      }
      throw error;
    }
  }
}

// Create a singleton instance
const folderSyncService = new FolderSyncService({
  basePath:
    process.env.FILE_STORAGE_PATH ||
    path.join(process.cwd(), "storage", "projects"),
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024, // 5MB
});

export default folderSyncService;
