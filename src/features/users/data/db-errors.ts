import "server-only";
import type { DatabaseError } from "pg";

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = "23505";

function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === "object" && error !== null && "code" in error;
}

// match by SQLSTATE code, not the error message text
export function isUniqueViolation(error: unknown, constraintName?: string): boolean {
  if (!isDatabaseError(error) || error.code !== UNIQUE_VIOLATION) return false;
  return constraintName ? error.constraint === constraintName : true;
}

type UserMutationAction = "create" | "update" | "delete";

// only really needs to handle the unique-email race (two requests both pass
// the emailExists pre-check, one loses the constraint) - everything else is
// caught before a query even runs. no FK-violation branch since orders and
// user_notes cascade from users, so delete can't hit one
export function describeDatabaseError(error: unknown, action: UserMutationAction): string {
  if (isUniqueViolation(error, "users_email_key")) {
    return "A user with this email already exists.";
  }
  return `Failed to ${action} user. Please try again.`;
}
