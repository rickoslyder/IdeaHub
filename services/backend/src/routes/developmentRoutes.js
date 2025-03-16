import { Router } from "express";
import {
  getAllDevelopments,
  getDevelopmentById,
  createDevelopment,
  updateDevelopment,
  deleteDevelopment,
} from "../controllers/developmentController.js";

const router = Router();

// GET all developments
router.get("/", getAllDevelopments);

// GET a single development by ID
router.get("/:id", getDevelopmentById);

// POST create a new development
router.post("/", createDevelopment);

// PUT update a development
router.put("/:id", updateDevelopment);

// DELETE a development
router.delete("/:id", deleteDevelopment);

export default router;
