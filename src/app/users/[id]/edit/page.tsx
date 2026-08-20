import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserRecord, listCompanies } from "@/features/users/data/queries";
import { updateUserAction } from "@/features/users/actions";
import { UserForm } from "@/features/users/client/UserForm";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const [user, companies] = await Promise.all([getUserRecord(userId), listCompanies()]);
  if (!user) {
    notFound();
  }

  const boundAction = updateUserAction.bind(null, userId);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <Link href={`/users/${userId}`} className="text-sm text-gray-500 hover:text-gray-800">
        ← Back to user
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">
        Edit {user.firstName} {user.lastName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Update this user&apos;s details.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UserForm action={boundAction} companies={companies} defaultValues={user} submitLabel="Save changes" />
      </div>
    </main>
  );
}
