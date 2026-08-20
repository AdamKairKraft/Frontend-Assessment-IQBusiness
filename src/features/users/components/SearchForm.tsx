import Link from "next/link";
import type { UsersSearchParams } from "../search-params";

// plain GET form, no client JS needed - the navigation itself updates the URL
export function SearchForm({ current }: { current: UsersSearchParams }) {
  return (
    <form action="/users" method="get" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="sort" value={current.sort} />
      <input type="hidden" name="direction" value={current.direction} />
      {current.pageSize !== 20 && (
        <input type="hidden" name="pageSize" value={current.pageSize} />
      )}
      <label htmlFor="search" className="sr-only">
        Search users
      </label>
      <input
        id="search"
        name="search"
        type="search"
        placeholder="Search by name or email…"
        defaultValue={current.search}
        className="w-64 max-w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        Search
      </button>
      {current.search && (
        <Link
          href="/users"
          className="text-sm text-gray-500 underline decoration-dotted hover:text-gray-800"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
