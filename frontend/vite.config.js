import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, Vite forwards /api and /media to Django on port 8000, so the
// browser only ever talks to one origin (no CORS setup needed locally).
const DJANGO = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": DJANGO,
      "/media": DJANGO,
    },
  },
});
