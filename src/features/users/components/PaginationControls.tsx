import Link from "next/link";
import { buildUsersQuery, PAGE_SIZE_OPTIONS, type UsersSearchParams } from "../search-params";
import { PageSizeSelect } from "../client/PageSizeSelect";

export function PaginationControls({
  current,
  total,
}: {
  current: UsersSearchParams;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / current.pageSize));
  const page = Math.min(current.page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const startRow = total === 0 ? 0 : (page - 1) * current.pageSize + 1;
  const endRow = Math.min(page * current.pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
      <div>
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-gray-900">{startRow}</span>–
            <span className="font-medium text-gray-900">{endRow}</span> of{" "}
            <span className="font-medium text-gray-900">{total}</span> users
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <PageSizeSelect current={current} options={PAGE_SIZE_OPTIONS} />
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <PageLink current={current} page={page - 1} disabled={!hasPrev} label="Previous" />
          <span className="px-2 text-gray-500">
            Page {page} of {totalPages}
          </span>
          <PageLink current={current} page={page + 1} disabled={!hasNext} label="Next" />
        </nav>
      </div>
    </div>
  );
}

function PageLink({
  current,
  page,
  disabled,
  label,
}: {
  current: UsersSearchParams;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md px-2.5 py-1 text-gray-300">{label}</span>
    );
  }
  const query = buildUsersQuery({ page }, current);
  return (
    <Link
      href={{ pathname: "/users", query }}
      className="rounded-md px-2.5 py-1 text-gray-700 hover:bg-gray-100"
    >
      {label}
    </Link>
  );
}
