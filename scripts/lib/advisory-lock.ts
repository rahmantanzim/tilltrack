import type { ClientBase } from "pg";

/**
 * Runs `work` while holding a PostgreSQL advisory lock.
 *
 * If two copies of a script start at the same time (for example, two deploys),
 * the second one waits here until the first finishes, instead of both changing
 * the database at once.
 */
export async function withAdvisoryLock<T>(
  client: ClientBase,
  lockName: string,
  work: () => Promise<T>,
): Promise<T> {
  // hashtext turns the name into the number that advisory locks need.
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [lockName]);
  try {
    return await work();
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [lockName]);
  }
}