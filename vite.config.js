import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages project site: https://elliotastern.github.io/mentoring-progress/
export default defineConfig({
  plugins: [react()],
  base: "/mentoring-progress/",
});
