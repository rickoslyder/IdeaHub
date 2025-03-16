#!/usr/bin/env node

import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Get the directory path and create a require function that works in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Debug function to explore the environment
function debugEnvironment() {
  console.log("🔍 DEBUG: Current directory:", process.cwd());
  console.log("🔍 DEBUG: Script directory:", __dirname);
  console.log("🔍 DEBUG: NODE_PATH:", process.env.NODE_PATH);
  console.log("🔍 DEBUG: PATH:", process.env.PATH);

  // Check if node_modules exists
  const nodeModulesPath = join(__dirname, "node_modules");
  console.log(
    `🔍 DEBUG: node_modules exists: ${fs.existsSync(nodeModulesPath)}`
  );

  // List node_modules/tailwindcss if it exists
  const tailwindPath = join(nodeModulesPath, "tailwindcss");
  if (fs.existsSync(tailwindPath)) {
    console.log(
      `🔍 DEBUG: tailwindcss folder contents:`,
      fs.readdirSync(tailwindPath).slice(0, 5),
      "..."
    );
  }

  // List node_modules/vite if it exists
  const vitePath = join(nodeModulesPath, "vite");
  if (fs.existsSync(vitePath)) {
    console.log(
      `🔍 DEBUG: vite folder contents:`,
      fs.readdirSync(vitePath).slice(0, 5),
      "..."
    );
  }
}

async function runBuild() {
  console.log("⚙️ Starting Render build process...");

  try {
    // Debug the environment before making changes
    debugEnvironment();

    // Install dependencies using yarn directly (more reliable in workspace context)
    console.log("📦 Installing dependencies with yarn...");
    execSync(
      "yarn add tailwindcss postcss autoprefixer vite @vitejs/plugin-react --dev",
      {
        stdio: "inherit",
        cwd: __dirname,
      }
    );

    // Debug after installation
    debugEnvironment();

    // Create a simple inline vite config file to avoid import issues
    const tempViteConfigPath = join(__dirname, "vite.temp.js");
    fs.writeFileSync(
      tempViteConfigPath,
      `
      import { defineConfig } from 'vite';
      import react from '@vitejs/plugin-react';
      
      export default defineConfig({
        plugins: [react()],
        build: {
          minify: true,
          sourcemap: false,
          target: "esnext",
          outDir: "dist",
        },
      });
    `
    );

    // Run vite directly with the temporary config
    console.log("🏗️ Running vite build with inline config...");
    execSync("yarn vite build --config vite.temp.js", {
      stdio: "inherit",
      cwd: __dirname,
    });

    // Clean up temporary config
    fs.unlinkSync(tempViteConfigPath);

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
