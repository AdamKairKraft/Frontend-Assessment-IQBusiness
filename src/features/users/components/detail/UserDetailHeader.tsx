import Link from "next/link";
import { DeleteUserButton } from "../../client/DeleteUserButton";
import type { UserRecord, ValueTier } from "../../types";
import { ActiveStatusPill, RoleBadge, ValueTierBadge } from "../Badges";

export function UserDetailHeader({
  user,
  valueTier,
}: {
  user: UserRecord;
  valueTier: ValueTier;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RoleBadge role={user.role} />
          <ActiveStatusPill isActive={user.isActive} />
          <ValueTierBadge tier={valueTier} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/users/${user.id}/edit`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>
        <DeleteUserButton userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
      </div>
    </div>
  );
}
