import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/api/**/*.test.ts"],
    setupFiles: ["./vitest.api.setup.ts"],
    testTimeout: 10000, // API tests may need more time
  },
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "./"),
    },
  },
});
