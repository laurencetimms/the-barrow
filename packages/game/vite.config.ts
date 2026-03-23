import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@the-barrow/terrain": path.resolve(__dirname, "../terrain/src"),
      "@the-barrow/voice": path.resolve(__dirname, "../voice/src"),
    },
  },
});
