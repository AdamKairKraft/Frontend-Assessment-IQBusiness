import "server-only";
import {
  getFavouriteCategory,
  getMostPurchasedProduct,
  getOrderSpendAggregate,
  getOrderStatusCounts,
  getRecentNotes,
  getRecentOrders,
  getUserRecord,
} from "../data/queries";
import { ORDER_STATUSES, type OrderStatus, type UserDetail, type ValueTier } from "../types";

const RECENT_ORDERS_LIMIT = 5;
const RECENT_NOTES_LIMIT = 10;

// bucket thresholds are just a judgement call, not from the schema
function classifyValueTier(totalSpend: number): ValueTier {
  if (totalSpend <= 0) return "None";
  if (totalSpend < 500) return "Bronze";
  if (totalSpend < 2000) return "Silver";
  if (totalSpend < 5000) return "Gold";
  return "Platinum";
}

function emptyOrdersByStatus(): Record<OrderStatus, number> {
  return ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );
}

// runs the aggregate queries in parallel and shapes the result into one
// object - the actual summing/grouping happens in SQL, this just assembles it
export async function getUserDetail(id: number): Promise<UserDetail | null> {
  const user = await getUserRecord(id);
  if (!user) return null;

  const [statusCounts, aggregate, favouriteCategory, mostFrequentProduct, recentOrders, notes] =
    await Promise.all([
      getOrderStatusCounts(id),
      getOrderSpendAggregate(id),
      getFavouriteCategory(id),
      getMostPurchasedProduct(id),
      getRecentOrders(id, RECENT_ORDERS_LIMIT),
      getRecentNotes(id, RECENT_NOTES_LIMIT),
    ]);

  const ordersByStatus = emptyOrdersByStatus();
  let totalOrders = 0;
  for (const row of statusCounts) {
    ordersByStatus[row.status] = row.count;
    totalOrders += row.count;
  }

  const averageOrderValue =
    aggregate.orderCount > 0 ? aggregate.totalSpend / aggregate.orderCount : 0;

  return {
    user,
    metrics: {
      totalOrders,
      ordersByStatus,
      totalSpend: aggregate.totalSpend,
      averageOrderValue,
      favouriteCategory: favouriteCategory?.category ?? null,
      mostFrequentProduct,
      mostRecentOrderAt: recentOrders[0]?.createdAt ?? null,
      valueTier: classifyValueTier(aggregate.totalSpend),
    },
    recentOrders,
    notes,
  };
}
