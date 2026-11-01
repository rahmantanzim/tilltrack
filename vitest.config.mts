import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Understand the `@/` import alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
  },
});
