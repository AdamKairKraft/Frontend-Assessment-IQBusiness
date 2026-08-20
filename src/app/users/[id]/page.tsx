import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/features/users/services/user-metrics.service";
import { UserDetailHeader } from "@/features/users/components/detail/UserDetailHeader";
import { UserProfileSummary } from "@/features/users/components/detail/UserProfileSummary";
import { OrderMetricsGrid } from "@/features/users/components/detail/OrderMetricsGrid";
import { OrdersByStatusSummary } from "@/features/users/components/detail/OrdersByStatusSummary";
import { RecentOrdersTable } from "@/features/users/components/detail/RecentOrdersTable";
import { UserNotesList } from "@/features/users/components/detail/UserNotesList";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const detail = await getUserDetail(userId);
  if (!detail) {
    notFound();
  }

  const { user, metrics, recentOrders, notes } = detail;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/users" className="text-sm text-gray-500 hover:text-gray-800">
        ← Back to users
      </Link>

      <UserDetailHeader user={user} valueTier={metrics.valueTier} />
      <UserProfileSummary user={user} />

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Order metrics</h2>
      <p className="mt-1 text-sm text-gray-500">
        Spend-based metrics exclude cancelled orders; order counts and status totals include
        them.
      </p>
      <OrderMetricsGrid metrics={metrics} />

      <h3 className="mt-6 text-sm font-medium text-gray-700">Orders by status</h3>
      <OrdersByStatusSummary ordersByStatus={metrics.ordersByStatus} />

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Recent orders</h2>
      <RecentOrdersTable orders={recentOrders} />

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Notes</h2>
      <UserNotesList notes={notes} />
    </main>
  );
}
