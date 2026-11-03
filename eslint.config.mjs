import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Use `import type` for type-only imports so they are erased at build time.
      "@typescript-eslint/consistent-type-imports": "error",
      // Unused variables are errors, except ones deliberately prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Structured logging only: console output bypasses the logger.
      "no-console": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Command-line scripts talk to the person running them, so console output is correct there.
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },
  // Must be last: turns off style rules that conflict with Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
