import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/terrain/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@the-barrow/terrain": path.resolve(__dirname, "../terrain/src"),
    },
  },
});
