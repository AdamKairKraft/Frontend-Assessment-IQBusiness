import { formatCalendarDate, formatDate } from "@/lib/format";
import type { UserRecord } from "../../types";

export function UserProfileSummary({ user }: { user: UserRecord }) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">Company</h2>
        <p className="mt-1 text-sm text-gray-900">{user.companyName}</p>
        <p className="text-xs text-gray-500">
          {user.companyIndustry} · {user.companyCountry}
        </p>
      </div>
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Date of birth
        </h2>
        <p className="mt-1 text-sm text-gray-900">{formatCalendarDate(user.dateOfBirth)}</p>
      </div>
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Customer since
        </h2>
        <p className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</p>
      </div>
    </section>
  );
}
