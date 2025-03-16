import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Skip TypeScript checks during build
  esbuild: {
    jsx: "react",
  },
  build: {
    // Ensure we don't fail on TS errors
    minify: true,
    sourcemap: false,
    target: "esnext",
    outDir: "dist",
  },
});
