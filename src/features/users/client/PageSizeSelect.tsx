"use client";

import { useRouter } from "next/navigation";
import { buildUsersQuery, type UsersSearchParams } from "../search-params";

export function PageSizeSelect({
  current,
  options,
}: {
  current: UsersSearchParams;
  options: readonly number[];
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-1.5 text-gray-600">
      Rows
      <select
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
        value={current.pageSize}
        onChange={(event) => {
          const query = buildUsersQuery(
            { pageSize: Number(event.target.value), page: 1 },
            current,
          );
          const qs = new URLSearchParams(query).toString();
          router.push(qs ? `/users?${qs}` : "/users");
        }}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
