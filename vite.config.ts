import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages hosts this project under /TableX/, not the domain root.
  base: "/TableX/",
  plugins: [react()],
  server: { host: "0.0.0.0" }
});
