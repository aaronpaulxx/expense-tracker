import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  base: "./", // Ensure assets load correctly in Electron

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: "dist", // Output the build into the 'dist' folder (default for Electron)
    emptyOutDir: true, // Clear out the 'dist' folder before building
    target: "esnext", // Ensure latest JS features are supported
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV), // Set NODE_ENV correctly
  },
});