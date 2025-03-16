import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import developmentRoutes from "./src/routes/developmentRoutes.js";
import relevanceRoutes from "./src/routes/relevanceRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import githubRoutes from "./src/routes/githubRoutes.js";
import folderSyncRoutes from "./src/routes/folderSyncRoutes.js";
import { testConnection } from "./src/config/database.js";
import { initializeDatabase } from "./src/utils/dbInit.js";

// Load environment variables
dotenv.config();

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
app.use("/api/developments", developmentRoutes);
app.use("/api/relevance", relevanceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/sync", folderSyncRoutes);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error("Failed to connect to the database");
      process.exit(1);
    }

    // Initialize database with model sync and seed data
    // In production, you would set force to false to preserve data
    const force =
      process.env.NODE_ENV === "development" &&
      process.env.DB_FORCE_SYNC === "true";
    const initialized = await initializeDatabase(force);
    if (!initialized) {
      console.error("Failed to initialize database");
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

// Execute startup
startServer();

export default app;
