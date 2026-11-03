/**
 * Turns an error into a short readable message for the terminal.
 *
 * Libraries often wrap the real database error inside `cause`
 * (for example "Failed query: <whole SQL file>"). We show the innermost
 * message, plus PostgreSQL's detail and hint when they exist.
 */
export function describeError(error: unknown): string {
  let current: unknown = error;
  while (current instanceof Error && current.cause !== undefined) {
    current = current.cause;
  }
  if (!(current instanceof Error)) {
    return String(current);
  }

  const lines = [current.message];
  const extra = current as Error & { detail?: unknown; hint?: unknown };
  if (typeof extra.detail === "string") lines.push(`Detail: ${extra.detail}`);
  if (typeof extra.hint === "string") lines.push(`Hint: ${extra.hint}`);
  return lines.join("\n");
}
