import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": ["react", "react-dom"],
          "router": ["react-router-dom"],
          "query": ["@tanstack/react-query"],
          "forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "store": ["zustand"],
          "icons": ["lucide-react"],
          "http": ["axios"],
        },
      },
    },
    minify: "terser",
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
