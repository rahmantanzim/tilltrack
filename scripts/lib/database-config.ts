/**
 * Shared settings for the database scripts (bootstrap and migrate).
 *
 * Role names are fixed, because migrations refer to them by name.
 * Passwords, hosts and database names come from connection URLs,
 * so each environment (laptop, CI, AWS) only changes its URLs.
 */

/** Owns the tables. Only used to run migrations. */
export const MIGRATOR_ROLE = "tilltrack_migrator";

/** Used by the running app. Owns nothing and is always subject to row-level security. */
export const APP_ROLE = "tilltrack_app";

export interface ConnectionInfo {
  readonly url: string;
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
  readonly database: string;
}

const SAFE_NAME = /^[a-z_][a-z0-9_]{0,62}$/;
const DEFAULT_POSTGRES_PORT = 5432;

/**
 * Reads a PostgreSQL connection URL from the environment and splits it into parts.
 * Throws a clear error that names the variable when anything is missing or malformed.
 */
export function readConnectionUrl(
  env: Record<string, string | undefined>,
  variable: string,
): ConnectionInfo {
  const value = env[variable];
  if (value === undefined || value === "") {
    throw new Error(`${variable} is not set. See .env.example.`);
  }
  if (!/^postgres(ql)?:\/\//.test(value)) {
    throw new Error(`${variable} must start with postgres:// or postgresql://`);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variable} is not a valid URL`);
  }

  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (user === "") throw new Error(`${variable} has no user name`);
  if (password === "") throw new Error(`${variable} has no password`);
  if (!SAFE_NAME.test(database)) {
    throw new Error(
      `${variable} database name "${database}" must use only lowercase letters, digits and _`,
    );
  }

  return {
    url: value,
    user,
    password,
    host: url.hostname,
    port: url.port === "" ? DEFAULT_POSTGRES_PORT : Number(url.port),
    database,
  };
}

/** Checks that a connection URL logs in as the role we expect. */
export function assertRole(info: ConnectionInfo, variable: string, expectedRole: string): void {
  if (info.user !== expectedRole) {
    throw new Error(`${variable} must log in as "${expectedRole}", but it uses "${info.user}"`);
  }
}

/** Checks that two URLs point at the same server and database. */
export function assertSameDatabase(a: ConnectionInfo, b: ConnectionInfo, names: string): void {
  if (a.host !== b.host || a.port !== b.port || a.database !== b.database) {
    throw new Error(`${names} must point at the same host, port and database`);
  }
}