import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { UsersSearchParams } from "../search-params";
import type { UserListItem } from "../types";
import { ActiveStatusPill, RoleBadge } from "./Badges";
import { SortLink } from "./SortLink";

export function UserTable({
  users,
  current,
}: {
  users: UserListItem[];
  current: UsersSearchParams;
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-4 py-16 text-center text-gray-500">
        <p className="text-base font-medium text-gray-700">No users found</p>
        <p className="text-sm">
          {current.search
            ? `No users match "${current.search}". Try a different search.`
            : "There are no users to display."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              <SortLink field="name" label="Name" current={current} />
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <SortLink field="email" label="Email" current={current} />
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <SortLink field="company" label="Company" current={current} />
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <SortLink field="role" label="Role" current={current} />
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <SortLink field="created" label="Joined" current={current} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link
                  href={`/users/${user.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {user.firstName} {user.lastName}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3 text-gray-600">{user.companyName}</td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-4 py-3">
                <ActiveStatusPill isActive={user.isActive} />
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
