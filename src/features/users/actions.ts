"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { describeDatabaseError } from "./data/db-errors";
import { createUser, deleteUser, updateUser } from "./data/mutations";
import { validateUserAgainstDatabase } from "./services/user-validation.service";
import {
  flattenFieldErrors,
  parseUserForm,
  type UserFormRawValues,
  type UserFormState,
  type UserFormValues,
} from "./validation";

type FormOutcome =
  | { ok: true; values: UserFormValues; raw: UserFormRawValues }
  | { ok: false; fieldErrors: Partial<Record<keyof UserFormValues, string>>; raw: UserFormRawValues };

// shared parse+validate step for create/update
async function processUserForm(formData: FormData, excludeUserId?: number): Promise<FormOutcome> {
  const { parsed, raw } = parseUserForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error), raw };
  }

  const fieldErrors = await validateUserAgainstDatabase(parsed.data, excludeUserId);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, raw };
  }

  return { ok: true, values: parsed.data, raw };
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const outcome = await processUserForm(formData);
  if (!outcome.ok) {
    return { status: "error", fieldErrors: outcome.fieldErrors, values: outcome.raw };
  }

  let newUserId: number;
  try {
    newUserId = await createUser(outcome.values);
  } catch (error) {
    return {
      status: "error",
      fieldErrors: {},
      formError: describeDatabaseError(error, "create"),
      values: outcome.raw,
    };
  }

  revalidatePath("/users");
  redirect(`/users/${newUserId}`);
}

export async function updateUserAction(
  userId: number,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const outcome = await processUserForm(formData, userId);
  if (!outcome.ok) {
    return { status: "error", fieldErrors: outcome.fieldErrors, values: outcome.raw };
  }

  try {
    const updated = await updateUser(userId, outcome.values);
    if (!updated) {
      return {
        status: "error",
        fieldErrors: {},
        formError: "This user no longer exists.",
        values: outcome.raw,
      };
    }
  } catch (error) {
    return {
      status: "error",
      fieldErrors: {},
      formError: describeDatabaseError(error, "update"),
      values: outcome.raw,
    };
  }

  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  redirect(`/users/${userId}`);
}

export async function deleteUserAction(userId: number): Promise<{ error?: string }> {
  try {
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return { error: "This user no longer exists." };
    }
  } catch (error) {
    return { error: describeDatabaseError(error, "delete") };
  }

  revalidatePath("/users");
  redirect("/users");
}
