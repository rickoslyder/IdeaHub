import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

// Load environment variables
dotenv.config();

// ESM specific features - replace __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Idea Hub API" });
});

// Apply routes
app.use("/api/projects", projectRoutes);
app.use("/api/github", githubRoutes);
// app.use('/api/developments', developmentRoutes);
// app.use('/api/relevance', relevanceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
