import Link from "next/link";
import { parseUsersSearchParams } from "@/features/users/search-params";
import { listUsers } from "@/features/users/data/queries";
import { SearchForm } from "@/features/users/components/SearchForm";
import { UserTable } from "@/features/users/components/UserTable";
import { PaginationControls } from "@/features/users/components/PaginationControls";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const current = parseUsersSearchParams(await searchParams);
  const { rows, total } = await listUsers(current);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search, sort and browse the user directory.
          </p>
        </div>
        <Link
          href="/users/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          New user
        </Link>
      </div>

      <div className="mb-4">
        <SearchForm current={current} />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <UserTable users={rows} current={current} />
        <PaginationControls current={current} total={total} />
      </div>
    </main>
  );
}
