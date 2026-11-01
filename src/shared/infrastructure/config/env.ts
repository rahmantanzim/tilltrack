import { z } from "zod";

/**
 * Every environment variable the server reads, in one place.
 * The app refuses to start if any value is missing or wrong,
 * so a bad deploy fails at once instead of in the middle of a request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z
    .string()
    .regex(
      /^postgres(ql)?:\/\/.+/,
      "must be a PostgreSQL URL, e.g. postgres://user:pass@host:5432/db",
    ),
});

export type Env = z.infer<typeof envSchema>;

export class InvalidEnvironmentError extends Error {
  constructor(details: string) {
    super(`Invalid environment variables:\n${details}`);
    this.name = "InvalidEnvironmentError";
  }
}

/**
 * Reads and checks environment variables.
 * Takes the source as a parameter so tests can pass their own values.
 */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new InvalidEnvironmentError(z.prettifyError(result.error));
  }
  return result.data;
}
