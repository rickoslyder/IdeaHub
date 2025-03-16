import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

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

// Import route modules
// We'll add these after we update them to use ESM
// import developmentRoutes from './routes/developments.js';
// import projectRoutes from './routes/projects.js';
// import relevanceRoutes from './routes/relevance.js';

// Apply routes
// app.use('/api/developments', developmentRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/relevance', relevanceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
