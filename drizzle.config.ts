import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit reads the TypeScript schema and writes SQL migration files.
 * It only generates files; migrations are applied by `npm run db:migrate`.
 * `drizzle-kit push` is not used: it changes the database without a migration file.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/infrastructure/db/schema/index.ts",
  out: "./db/migrations",
  casing: "snake_case",
  strict: true,
  verbose: true,
});
