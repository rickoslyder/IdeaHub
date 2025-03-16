import express from "express";
import multer from "multer";
import folderSyncController from "../controllers/folderSyncController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @route POST /api/sync/folder
 * @desc Process folder sync changes
 * @access Private
 */
router.post(
  "/folder",
  upload.array("files"),
  folderSyncController.processChanges
);

/**
 * @route GET /api/sync/projects/:projectId/files
 * @desc List files in a project directory
 * @access Private
 */
router.get("/projects/:projectId/files", folderSyncController.listFiles);

/**
 * @route GET /api/sync/projects/:projectId/files/:filePath
 * @desc Get file contents from a project
 * @access Private
 */
router.get(
  "/projects/:projectId/files/:filePath(*)",
  folderSyncController.getFile
);

export default router;
