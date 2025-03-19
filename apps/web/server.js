import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting web server...");
console.log("Server environment:", process.env.NODE_ENV);
console.log("Static files will be served from:", path.join(__dirname, "dist"));

// Check if dist directory exists
if (fs.existsSync(path.join(__dirname, "dist"))) {
  console.log("✅ dist directory exists");

  // Check CSS file existence
  const cssFiles = fs
    .readdirSync(path.join(__dirname, "dist", "assets"))
    .filter((file) => file.endsWith(".css"));

  if (cssFiles.length > 0) {
    console.log("✅ CSS files found:", cssFiles);
  } else {
    console.warn("⚠️ No CSS files found in assets directory");
  }
} else {
  console.error("❌ dist directory does not exist");
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// For any request that doesn't match a static file, serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
