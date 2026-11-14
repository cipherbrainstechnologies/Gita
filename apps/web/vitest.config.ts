import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

// Mirrors the `@/*` path alias from tsconfig.json so server modules under src/ can be unit-tested with injected dependencies.
export default defineConfig({
  resolve: {alias: {"@": fileURLToPath(new URL("./src", import.meta.url))}},
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/docs/**", "**/.next/**"],
  },
});
