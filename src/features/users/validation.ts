import { z } from "zod";
import { todayDateString } from "@/lib/format";
import { USER_ROLES } from "./types";

// sync validation only - DB checks (email uniqueness, company exists) live
// in services/user-validation.service.ts
export const userFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(180),
  companyId: z.coerce.number({ message: "Select a company" }).int().positive("Select a company"),
  role: z.enum(USER_ROLES, { message: "Select a valid role" }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => value <= todayDateString(), "Date of birth cannot be in the future"),
  isActive: z.coerce.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// echoed back on a failed submit so the form doesn't lose what was typed
export interface UserFormRawValues {
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  role: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface UserFormState {
  status: "idle" | "error";
  fieldErrors: Partial<Record<keyof UserFormValues, string>>;
  formError?: string;
  values?: UserFormRawValues;
}

export const initialUserFormState: UserFormState = {
  status: "idle",
  fieldErrors: {},
};

function extractRawValues(formData: FormData): UserFormRawValues {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    companyId: String(formData.get("companyId") ?? ""),
    role: String(formData.get("role") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

export function parseUserForm(formData: FormData) {
  const raw = extractRawValues(formData);
  const parsed = userFormSchema.safeParse(raw);
  return { parsed, raw };
}

export function flattenFieldErrors(
  error: z.ZodError,
): Partial<Record<keyof UserFormValues, string>> {
  const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof UserFormValues | undefined;
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
