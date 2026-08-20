import { formatCurrency, formatDateTime } from "@/lib/format";
import type { RecentOrder } from "../../types";
import { OrderStatusBadge } from "../Badges";

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <p className="px-4 py-6 text-sm text-gray-500">This user has no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Order</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Placed</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-2 text-gray-900">#{order.id}</td>
              <td className="px-4 py-2">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-2 text-gray-500">{formatDateTime(order.createdAt)}</td>
              <td className="px-4 py-2 text-right text-gray-900">{formatCurrency(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
