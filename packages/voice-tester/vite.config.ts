import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/the-barrow/voice/",
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@the-barrow/voice": path.resolve(__dirname, "../voice/src"),
    },
  },
});
