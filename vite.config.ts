import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Commented out until lovable-tagger is installed
// // Commented out until lovable-tagger is installed
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean), // Removed componentTagger until package is installed
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
