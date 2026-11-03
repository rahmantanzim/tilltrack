/**
 * Creates the database roles and the database, or brings existing ones up to date.
 *
 * Run once per environment, and again after changing a password:
 *   npm run db:bootstrap
 *
 * Needs an admin connection (DATABASE_ADMIN_URL) that can create roles and databases.
 * It is safe to run many times: every step checks what exists and only changes what differs.
 */
import pg from "pg";
import { withAdvisoryLock } from "./lib/advisory-lock.ts";
import { describeError } from "./lib/describe-error.ts";
import {
  APP_ROLE,
  MIGRATOR_ROLE,
  assertRole,
  assertSameDatabase,
  readConnectionUrl,
} from "./lib/database-config.ts";

const { Client, escapeIdentifier, escapeLiteral } = pg;

interface RoleSpec {
  readonly name: string;
  readonly password: string;
  /** Per-role settings applied to every new session of that role. */
  readonly settings: Readonly<Record<string, string>>;
}

async function main(): Promise<void> {
  const admin = readConnectionUrl(process.env, "DATABASE_ADMIN_URL");
  const migrator = readConnectionUrl(process.env, "DATABASE_MIGRATOR_URL");
  const app = readConnectionUrl(process.env, "DATABASE_URL");

  assertRole(migrator, "DATABASE_MIGRATOR_URL", MIGRATOR_ROLE);
  assertRole(app, "DATABASE_URL", APP_ROLE);
  assertSameDatabase(migrator, app, "DATABASE_MIGRATOR_URL and DATABASE_URL");

  const roles: readonly RoleSpec[] = [
    {
      name: MIGRATOR_ROLE,
      password: migrator.password,
      // A migration waiting on a busy table gives up after 10s instead of blocking the app.
      settings: { lock_timeout: "10s" },
    },
    {
      name: APP_ROLE,
      password: app.password,
      settings: {
        // A runaway query cannot hold a pooled connection forever.
        statement_timeout: "15s",
        // A forgotten open transaction is closed instead of holding locks.
        idle_in_transaction_session_timeout: "30s",
      },
    },
  ];

  const client = new Client({ connectionString: admin.url });
  await client.connect();
  try {
    await withAdvisoryLock(client, "tilltrack:bootstrap", async () => {
      for (const role of roles) {
        await ensureRole(client, role);
      }
      await ensureDatabase(client, app.database);
    });
  } finally {
    await client.end();
  }

  console.log(`Bootstrap complete: roles ${MIGRATOR_ROLE}, ${APP_ROLE}; database ${app.database}.`);
}

async function ensureRole(client: pg.Client, role: RoleSpec): Promise<void> {
  const name = escapeIdentifier(role.name);
  const exists = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [role.name]);

  if (exists.rowCount === 0) {
    await client.query(`CREATE ROLE ${name}`);
    console.log(`Created role ${role.name}.`);
  }

  // Always reset attributes and password, so the role matches this script exactly.
  // DDL cannot take $1 parameters, so the password is escaped as a literal.
  await client.query(
    `ALTER ROLE ${name} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS ` +
      `PASSWORD ${escapeLiteral(role.password)}`,
  );
  for (const [setting, value] of Object.entries(role.settings)) {
    await client.query(
      `ALTER ROLE ${name} SET ${escapeIdentifier(setting)} = ${escapeLiteral(value)}`,
    );
  }
}

async function ensureDatabase(client: pg.Client, database: string): Promise<void> {
  const db = escapeIdentifier(database);
  const migrator = escapeIdentifier(MIGRATOR_ROLE);
  const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);

  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE ${db} OWNER ${migrator}`);
    console.log(`Created database ${database}.`);
  } else {
    await client.query(`ALTER DATABASE ${db} OWNER TO ${migrator}`);
  }

  // Only our two roles may connect. The owner (migrator) can always connect.
  await client.query(`REVOKE ALL ON DATABASE ${db} FROM PUBLIC`);
  await client.query(`GRANT CONNECT ON DATABASE ${db} TO ${escapeIdentifier(APP_ROLE)}`);
}

main().catch((error: unknown) => {
  console.error(`Bootstrap failed: ${describeError(error)}`);
  process.exitCode = 1;
});