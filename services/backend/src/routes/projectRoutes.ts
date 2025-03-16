import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

// GET all projects
router.get("/", getAllProjects);

// GET a single project by ID
router.get("/:id", getProjectById);

// POST create a new project
router.post("/", createProject);

// PUT update a project
router.put("/:id", updateProject);

// DELETE a project
router.delete("/:id", deleteProject);

export default router;
