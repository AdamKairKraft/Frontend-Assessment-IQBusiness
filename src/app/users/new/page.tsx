import Link from "next/link";
import { listCompanies } from "@/features/users/data/queries";
import { createUserAction } from "@/features/users/actions";
import { UserForm } from "@/features/users/client/UserForm";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const companies = await listCompanies();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/users" className="text-sm text-gray-500 hover:text-gray-800">
        ← Back to users
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">New user</h1>
      <p className="mt-1 text-sm text-gray-500">Create a user record in the database.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UserForm action={createUserAction} companies={companies} submitLabel="Create user" />
      </div>
    </main>
  );
}
