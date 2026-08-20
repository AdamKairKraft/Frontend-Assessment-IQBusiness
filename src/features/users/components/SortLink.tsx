import Link from "next/link";
import { buildUsersQuery, type SortField, type UsersSearchParams } from "../search-params";

export function SortLink({
  field,
  label,
  current,
}: {
  field: SortField;
  label: string;
  current: UsersSearchParams;
}) {
  const isActive = current.sort === field;
  const nextDirection = isActive && current.direction === "asc" ? "desc" : "asc";
  const query = buildUsersQuery({ sort: field, direction: nextDirection, page: 1 }, current);

  return (
    <Link
      href={{ pathname: "/users", query }}
      className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {label}
      <span className="text-xs text-gray-400" aria-hidden>
        {isActive ? (current.direction === "asc" ? "▲" : "▼") : "↕"}
      </span>
      <span className="sr-only">
        {isActive ? `sorted ${current.direction === "asc" ? "ascending" : "descending"}` : "not sorted"}
      </span>
    </Link>
  );
}
