import type { OrderStatus } from "../../types";
import { ORDER_STATUSES } from "../../types";
import { OrderStatusBadge } from "../Badges";

export function OrdersByStatusSummary({
  ordersByStatus,
}: {
  ordersByStatus: Record<OrderStatus, number>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {ORDER_STATUSES.map((status) => (
        <div
          key={status}
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <OrderStatusBadge status={status} />
          <span className="font-medium text-gray-900">{ordersByStatus[status]}</span>
        </div>
      ))}
    </div>
  );
}
