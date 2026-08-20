export const USER_ROLES = ["ADMIN", "MANAGER", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  companyName: string;
}

export interface UserListResult {
  rows: UserListItem[];
  total: number;
}

export interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  companyName: string;
  companyIndustry: string;
  companyCountry: string;
}

export interface Company {
  id: number;
  name: string;
}

export type ValueTier = "None" | "Bronze" | "Silver" | "Gold" | "Platinum";

export interface RecentOrder {
  id: number;
  status: OrderStatus;
  createdAt: string;
  total: number;
}

export interface UserNote {
  id: number;
  note: string;
  createdAt: string;
}

export interface FavouriteCategory {
  category: string;
  spend: number;
}

export interface MostPurchasedProduct {
  id: number;
  name: string;
  quantity: number;
}

export interface UserDetail {
  user: UserRecord;
  metrics: {
    totalOrders: number;
    ordersByStatus: Record<OrderStatus, number>;
    totalSpend: number;
    averageOrderValue: number;
    favouriteCategory: string | null;
    mostFrequentProduct: MostPurchasedProduct | null;
    mostRecentOrderAt: string | null;
    valueTier: ValueTier;
  };
  recentOrders: RecentOrder[];
  notes: UserNote[];
}
