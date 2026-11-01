import { describe, expect, it } from "vitest";
import { InvalidEnvironmentError, loadEnv } from "@/shared/infrastructure/config/env";

const validUrl = "postgres://tilltrack:tilltrack@localhost:5432/tilltrack";

describe("loadEnv", () => {
  it("returns the values when everything is valid", () => {
    const env = loadEnv({ NODE_ENV: "test", LOG_LEVEL: "debug", DATABASE_URL: validUrl });

    expect(env).toEqual({ NODE_ENV: "test", LOG_LEVEL: "debug", DATABASE_URL: validUrl });
  });

  it("uses defaults for optional values", () => {
    const env = loadEnv({ DATABASE_URL: validUrl });

    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("accepts the postgresql:// form of the URL", () => {
    const url = "postgresql://user:pass@db.example.com:5432/app";

    expect(loadEnv({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
  });

  it("fails when DATABASE_URL is missing", () => {
    expect(() => loadEnv({})).toThrow(InvalidEnvironmentError);
  });

  it("fails when DATABASE_URL is not a PostgreSQL URL", () => {
    expect(() => loadEnv({ DATABASE_URL: "mysql://localhost/app" })).toThrow(
      /must be a PostgreSQL URL/,
    );
  });

  it("fails when LOG_LEVEL is not a known level", () => {
    expect(() => loadEnv({ DATABASE_URL: validUrl, LOG_LEVEL: "loud" })).toThrow(/LOG_LEVEL/);
  });
});
