import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: "dash-assets",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.SIMPLE_AUTH": process.env.SIMPLE_AUTH === "true",
  },
});
