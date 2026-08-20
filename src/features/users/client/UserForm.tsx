"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { todayDateString } from "@/lib/format";
import { initialUserFormState, type UserFormState } from "../validation";
import type { Company, UserRecord } from "../types";
import { USER_ROLES } from "../types";

type ActionFn = (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;

// role is a plain string here since it can also hold unvalidated raw input
// echoed back from a failed submit
type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  role: string;
  dateOfBirth: string;
  isActive: boolean;
};

export function UserForm({
  action,
  companies,
  defaultValues,
  submitLabel,
}: {
  action: ActionFn;
  companies: Company[];
  defaultValues?: Pick<
    UserRecord,
    "firstName" | "lastName" | "email" | "companyId" | "role" | "dateOfBirth" | "isActive"
  >;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialUserFormState);

  // prefer what the user just typed (echoed back on error) over defaultValues,
  // otherwise a failed submit wipes the form back to the original record
  const values: FormValues = state.values ?? {
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    email: defaultValues?.email ?? "",
    companyId: defaultValues?.companyId ? String(defaultValues.companyId) : "",
    role: defaultValues?.role ?? "USER",
    dateOfBirth: defaultValues?.dateOfBirth?.slice(0, 10) ?? "",
    isActive: defaultValues?.isActive ?? true,
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.formError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.formError}
        </div>
      )}

      <FormFields state={state} values={values} companies={companies} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

// split out so it can call useFormStatus() - that only works inside the form,
// not in the component that renders the <form> tag itself
function FormFields({
  state,
  values,
  companies,
}: {
  state: UserFormState;
  values: FormValues;
  companies: Company[];
}) {
  const { pending } = useFormStatus();

  return (
    <fieldset disabled={pending} className="contents">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" error={state.fieldErrors.firstName}>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            maxLength={80}
            defaultValue={values.firstName}
            className={inputClassName(state.fieldErrors.firstName)}
          />
        </Field>

        <Field label="Last name" name="lastName" error={state.fieldErrors.lastName}>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            maxLength={80}
            defaultValue={values.lastName}
            className={inputClassName(state.fieldErrors.lastName)}
          />
        </Field>
      </div>

      <Field label="Email" name="email" error={state.fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={180}
          defaultValue={values.email}
          className={inputClassName(state.fieldErrors.email)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company" name="companyId" error={state.fieldErrors.companyId}>
          <select
            // select ignores defaultValue changes after mount (unlike input),
            // key forces a remount so it actually updates on a failed submit
            key={values.companyId}
            id="companyId"
            name="companyId"
            required
            defaultValue={values.companyId}
            className={inputClassName(state.fieldErrors.companyId)}
          >
            <option value="" disabled>
              Select a company…
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Role" name="role" error={state.fieldErrors.role}>
          <select
            key={values.role} // see the comment on the Company <select> above
            id="role"
            name="role"
            required
            defaultValue={values.role}
            className={inputClassName(state.fieldErrors.role)}
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date of birth" name="dateOfBirth" error={state.fieldErrors.dateOfBirth}>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            max={todayDateString()}
            defaultValue={values.dateOfBirth}
            className={inputClassName(state.fieldErrors.dateOfBirth)}
          />
        </Field>

        <div className="flex items-end pb-2">
          <label htmlFor="isActive" className="flex items-center gap-2 text-sm text-gray-700">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={values.isActive}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active user
          </label>
        </div>
      </div>
    </fieldset>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClassName(error?: string): string {
  return `w-full rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-gray-300 focus:border-gray-500"
  }`;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
