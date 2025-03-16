#!/usr/bin/env node

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("⚙️ Starting web app build process...");

try {
  // Install the specific dependencies we need for Tailwind CSS v4
  console.log("📦 Installing Tailwind CSS v4 and related dependencies...");
  execSync(
    "yarn add -D tailwindcss@latest @tailwindcss/postcss autoprefixer@latest postcss@latest",
    {
      stdio: "inherit",
      cwd: __dirname,
    }
  );

  // Run the build command with Vite
  console.log("🏗️ Running Vite build...");
  execSync("yarn vite build", {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
