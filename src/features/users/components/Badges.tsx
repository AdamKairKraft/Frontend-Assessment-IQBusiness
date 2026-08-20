import type { OrderStatus, UserRole } from "../types";

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800 ring-purple-200",
  MANAGER: "bg-blue-100 text-blue-800 ring-blue-200",
  USER: "bg-gray-100 text-gray-700 ring-gray-200",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}

export function ActiveStatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
          : "bg-red-100 text-red-700 ring-red-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
        aria-hidden
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  PROCESSING: "bg-blue-100 text-blue-800 ring-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 ring-red-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ORDER_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const TIER_STYLES: Record<string, string> = {
  None: "bg-gray-100 text-gray-600 ring-gray-200",
  Bronze: "bg-orange-100 text-orange-800 ring-orange-200",
  Silver: "bg-slate-200 text-slate-800 ring-slate-300",
  Gold: "bg-yellow-100 text-yellow-800 ring-yellow-300",
  Platinum: "bg-indigo-100 text-indigo-800 ring-indigo-200",
};

export function ValueTierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        TIER_STYLES[tier] ?? TIER_STYLES.None
      }`}
    >
      {tier}
    </span>
  );
}
