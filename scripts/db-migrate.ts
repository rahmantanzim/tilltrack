/**
 * Applies new SQL migrations from db/migrations, in order.
 *
 *   npm run db:migrate
 *
 * Connects as the migrator role, which owns the tables. Migrations already applied
 * are recorded in drizzle.__drizzle_migrations and skipped. Each migration file runs
 * in a transaction, so a failing file leaves the database unchanged.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { withAdvisoryLock } from "./lib/advisory-lock.ts";
import { describeError } from "./lib/describe-error.ts";
import { MIGRATOR_ROLE, assertRole, readConnectionUrl } from "./lib/database-config.ts";

const MIGRATIONS_FOLDER = "./db/migrations";

async function main(): Promise<void> {
  const migrator = readConnectionUrl(process.env, "DATABASE_MIGRATOR_URL");
  assertRole(migrator, "DATABASE_MIGRATOR_URL", MIGRATOR_ROLE);

  // One connection holds the lock; a second one runs the migrations.
  const lockClient = new pg.Client({ connectionString: migrator.url });
  const pool = new pg.Pool({ connectionString: migrator.url, max: 1 });

  await lockClient.connect();
  try {
    await withAdvisoryLock(lockClient, "tilltrack:migrate", async () => {
      await migrate(drizzle({ client: pool }), { migrationsFolder: MIGRATIONS_FOLDER });
    });
  } finally {
    await Promise.allSettled([lockClient.end(), pool.end()]);
  }

  console.log(`Migrations are up to date on database ${migrator.database}.`);
}

main().catch((error: unknown) => {
  console.error(`Migration failed: ${describeError(error)}`);
  process.exitCode = 1;
});
