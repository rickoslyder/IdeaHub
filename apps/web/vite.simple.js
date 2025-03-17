// Simple CommonJS Vite config for production builds
const path = require("path");

module.exports = {
  plugins: [require("@vitejs/plugin-react")()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
};
