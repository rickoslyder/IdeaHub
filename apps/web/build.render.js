#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The main function to run the build process
async function runBuild() {
  console.log("⚙️ Starting Render build process...");

  try {
    // Ensure Tailwind CSS and related dependencies are installed
    console.log("📦 Installing CSS dependencies...");
    execSync("npm install -g tailwindcss postcss autoprefixer", {
      stdio: "inherit",
      cwd: __dirname,
    });

    console.log("📦 Installing local CSS dependencies...");
    execSync("npm install tailwindcss postcss autoprefixer", {
      stdio: "inherit",
      cwd: __dirname,
    });

    // Check that tailwindcss was installed
    try {
      const tailwindPath = require.resolve("tailwindcss", {
        paths: [__dirname],
      });
      console.log(`✅ Tailwind CSS found at: ${tailwindPath}`);
    } catch (error) {
      console.error(
        "❌ Tailwind CSS not found in node_modules. This may cause build issues."
      );
      console.error(error);
    }

    // Run the build command
    console.log("🏗️ Running build with Vite...");
    execSync("npx vite build --config vite.config.render.js", {
      stdio: "inherit",
      cwd: __dirname,
    });

    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run the build
runBuild().catch((error) => {
  console.error("❌ Unhandled error during build:", error);
  process.exit(1);
});
