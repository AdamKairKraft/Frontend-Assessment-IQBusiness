import "server-only";
import { companyExists, emailExists } from "../data/queries";
import type { UserFormValues } from "../validation";

// DB checks that can't live in the sync zod schema. the actual guard
// against a race is still the DB's unique constraint (see db-errors.ts) -
// this is just for a fast, specific error message
export async function validateUserAgainstDatabase(
  values: UserFormValues,
  excludeUserId?: number,
): Promise<Partial<Record<keyof UserFormValues, string>>> {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};

  const [emailTaken, companyValid] = await Promise.all([
    emailExists(values.email, excludeUserId),
    companyExists(values.companyId),
  ]);

  if (emailTaken) {
    errors.email = "A user with this email already exists";
  }
  if (!companyValid) {
    errors.companyId = "Select a valid company";
  }

  return errors;
}
