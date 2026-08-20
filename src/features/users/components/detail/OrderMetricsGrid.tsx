import { formatCurrency, formatDate } from "@/lib/format";
import type { UserDetail } from "../../types";
import { ValueTierBadge } from "../Badges";
import { StatCard } from "../StatCard";

export function OrderMetricsGrid({ metrics }: { metrics: UserDetail["metrics"] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard label="Total orders" value={metrics.totalOrders} />
      <StatCard label="Total spend" value={formatCurrency(metrics.totalSpend)} />
      <StatCard label="Average order value" value={formatCurrency(metrics.averageOrderValue)} />
      <StatCard
        label="Most recent order"
        value={metrics.mostRecentOrderAt ? formatDate(metrics.mostRecentOrderAt) : "—"}
      />
      <StatCard label="Favourite category" value={metrics.favouriteCategory ?? "—"} />
      <StatCard
        label="Most purchased product"
        value={metrics.mostFrequentProduct?.name ?? "—"}
        hint={
          metrics.mostFrequentProduct ? `${metrics.mostFrequentProduct.quantity} units` : undefined
        }
      />
      <StatCard label="Customer value tier" value={<ValueTierBadge tier={metrics.valueTier} />} />
    </div>
  );
}
