import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Project } from "../models/index.js";

// Types for file events
type FileEvent = "add" | "change" | "unlink" | "addDir" | "unlinkDir";
type FileChange = {
  event: FileEvent;
  path: string;
  relativePath: string;
  content?: string;
  isDirectory: boolean;
};

// Upload payload
interface FolderSyncPayload {
  projectId: string;
  changes: FileChange[];
}

// Service configuration
interface FolderSyncConfig {
  basePath: string; // Base directory for storing project files
  maxFileSizeBytes: number; // Maximum file size to store
}

export class FolderSyncService {
  private config: FolderSyncConfig;

  constructor(config: FolderSyncConfig) {
    this.config = {
      ...config,
      maxFileSizeBytes: config.maxFileSizeBytes || 5 * 1024 * 1024, // Default to 5MB
    };

    // Ensure storage directory exists
    this.ensureStorageDirectory();
  }

  /**
   * Process file changes for a project
   * @param payload - Folder sync payload with project ID and changes
   */
  public async processChanges(payload: FolderSyncPayload): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const { projectId, changes } = payload;
    const errors: string[] = [];
    let processed = 0;
    let failed = 0;

    try {
      // Verify project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Ensure project directory exists
      const projectDir = path.join(this.config.basePath, projectId);
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
            `Failed to process ${change.relativePath}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // Update project's lastSynced field
      await project.update({ lastSynced: new Date() });

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
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Process a single file change
   * @param projectId - Project ID
   * @param change - File change to process
   */
  private async processChange(
    projectId: string,
    change: FileChange
  ): Promise<void> {
    const fullPath = path.join(
      this.config.basePath,
      projectId,
      change.relativePath
    );

    switch (change.event) {
      case "add":
      case "change":
        if (change.isDirectory) {
          await this.ensureDirectory(fullPath);
        } else {
          // Check file size limit
          if (
            change.content &&
            Buffer.byteLength(change.content, "utf8") >
              this.config.maxFileSizeBytes
          ) {
            throw new Error(
              `File ${change.relativePath} exceeds maximum size limit`
            );
          }

          // Create parent directory if needed
          await this.ensureDirectory(path.dirname(fullPath));

          // Write file content
          await fs.promises.writeFile(fullPath, change.content || "");
        }
        break;

      case "unlink":
        if (await this.fileExists(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
        break;

      case "unlinkDir":
        if (await this.directoryExists(fullPath)) {
          await fs.promises.rm(fullPath, { recursive: true, force: true });
        }
        break;

      default:
        console.warn(`Unhandled file event type: ${change.event}`);
    }
  }

  /**
   * Ensure a directory exists
   * @param dirPath - Directory path to ensure
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }

  /**
   * Ensure the base storage directory exists
   */
  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.config.basePath)) {
      fs.mkdirSync(this.config.basePath, { recursive: true });
      console.log(`Created storage directory: ${this.config.basePath}`);
    }
  }

  /**
   * Check if a file exists
   * @param filePath - File path to check
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a directory exists
   * @param dirPath - Directory path to check
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.promises.stat(dirPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all files for a project
   * @param projectId - Project ID
   */
  public async getProjectFiles(projectId: string): Promise<{
    success: boolean;
    files?: {
      relativePath: string;
      isDirectory: boolean;
      sizeBytes?: number;
    }[];
    error?: string;
  }> {
    try {
      // Verify project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const projectDir = path.join(this.config.basePath, projectId);

      // Check if project directory exists
      if (!(await this.directoryExists(projectDir))) {
        return { success: true, files: [] };
      }

      // Get all files recursively
      const files = await this.getAllFiles(projectDir, projectId);

      return { success: true, files };
    } catch (error) {
      console.error(`Error getting files for project ${projectId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Recursively get all files in a directory
   * @param dirPath - Directory path to scan
   * @param projectId - Project ID for creating relative paths
   * @param relativePath - Current relative path
   */
  private async getAllFiles(
    dirPath: string,
    projectId: string,
    relativePath: string = ""
  ): Promise<
    { relativePath: string; isDirectory: boolean; sizeBytes?: number }[]
  > {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    const result: {
      relativePath: string;
      isDirectory: boolean;
      sizeBytes?: number;
    }[] = [];

    for (const entry of entries) {
      const entryRelativePath = path.join(relativePath, entry.name);
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Add directory entry
        result.push({
          relativePath: entryRelativePath,
          isDirectory: true,
        });

        // Recursively get files in subdirectory
        const subDirFiles = await this.getAllFiles(
          fullPath,
          projectId,
          entryRelativePath
        );
        result.push(...subDirFiles);
      } else if (entry.isFile()) {
        // Get file stats
        const stats = await fs.promises.stat(fullPath);

        result.push({
          relativePath: entryRelativePath,
          isDirectory: false,
          sizeBytes: stats.size,
        });
      }
    }

    return result;
  }

  /**
   * Get file content by path
   * @param projectId - Project ID
   * @param filePath - Relative file path
   */
  public async getFileContent(
    projectId: string,
    filePath: string
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    mimeType?: string;
  }> {
    try {
      // Verify project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const fullPath = path.join(this.config.basePath, projectId, filePath);

      // Check if file exists
      if (!(await this.fileExists(fullPath))) {
        throw new Error(`File ${filePath} not found`);
      }

      // Check file size
      const stats = await fs.promises.stat(fullPath);
      if (stats.size > this.config.maxFileSizeBytes) {
        throw new Error(
          `File ${filePath} exceeds maximum size limit for direct transfer`
        );
      }

      // Read file content
      const content = await fs.promises.readFile(fullPath, "utf8");

      // Determine MIME type (simple implementation)
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = this.getMimeType(ext);

      return { success: true, content, mimeType };
    } catch (error) {
      console.error(
        `Error getting file content for ${filePath} in project ${projectId}:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get MIME type from file extension
   * @param extension - File extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      ".txt": "text/plain",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
    };

    return mimeTypes[extension] || "application/octet-stream";
  }
}

// Create a singleton instance
const folderSyncService = new FolderSyncService({
  basePath:
    process.env.FILE_STORAGE_PATH ||
    path.join(process.cwd(), "storage", "projects"),
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024,
});

export default folderSyncService;
