import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 3000 matches the backend's default CORS_ALLOWED_ORIGINS
// (http://localhost:3000), so `npm run dev` talks to a local Django
// instance with zero extra configuration.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
