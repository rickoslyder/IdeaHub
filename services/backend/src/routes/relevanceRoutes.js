import { Router } from "express";
import {
  getRelevantProjects,
  getRelevantDevelopments,
} from "../controllers/relevanceController.js";

const router = Router();

// GET relevant projects for a development
router.get("/development/:id/projects", getRelevantProjects);

// GET relevant developments for a project
router.get("/project/:id/developments", getRelevantDevelopments);

export default router;
