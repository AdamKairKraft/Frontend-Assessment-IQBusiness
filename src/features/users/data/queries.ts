import "server-only";
import { query, queryOne } from "@/lib/db";
import type { SortDirection, SortField, UsersSearchParams } from "../search-params";
import type {
  Company,
  FavouriteCategory,
  MostPurchasedProduct,
  OrderStatus,
  RecentOrder,
  UserListResult,
  UserNote,
  UserRecord,
} from "../types";
import { mapUserListRow, mapUserRecordRow, type UserListRow, type UserRecordRow } from "./mappers";

// whitelist - the URL only ever picks a key here, never a raw column name.
// always tiebreak on id: role/company/created_at have lots of duplicate
// values, and paging through a non-unique ORDER BY isn't guaranteed stable
// (found this the hard way - role sort was repeating rows across pages)
const SORT_COLUMNS: Record<SortField, readonly string[]> = {
  name: ["u.last_name", "u.first_name"],
  email: ["u.email"],
  created: ["u.created_at"],
  company: ["c.name"],
  role: ["u.role"],
};

function buildOrderByClause(sort: SortField, direction: SortDirection): string {
  const dir: SortDirection = direction === "desc" ? "desc" : "asc";
  return [...SORT_COLUMNS[sort], "u.id"].map((column) => `${column} ${dir}`).join(", ");
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

const USERS_FROM_CLAUSE = "from users u join companies c on c.id = u.company_id";

export async function listUsers(params: UsersSearchParams): Promise<UserListResult> {
  const { page, pageSize, search, sort, direction } = params;
  const hasSearch = search.length > 0;

  const whereClause = hasSearch
    ? `where (u.first_name ilike $1 escape '\\' or u.last_name ilike $1 escape '\\' or u.email ilike $1 escape '\\' or (u.first_name || ' ' || u.last_name) ilike $1 escape '\\')`
    : "";
  const whereParams = hasSearch ? [`%${escapeLikePattern(search)}%`] : [];

  // derive the placeholder index instead of hand-counting per branch
  const limitParam = `$${whereParams.length + 1}`;
  const offsetParam = `$${whereParams.length + 2}`;
  const dataParams = [...whereParams, pageSize, (page - 1) * pageSize];

  const [countRows, rows] = await Promise.all([
    query<{ count: number }>(
      `select count(*)::int as count ${USERS_FROM_CLAUSE} ${whereClause}`,
      whereParams,
    ),
    query<UserListRow>(
      `select u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at,
              c.name as company_name
       ${USERS_FROM_CLAUSE}
       ${whereClause}
       order by ${buildOrderByClause(sort, direction)}
       limit ${limitParam} offset ${offsetParam}`,
      dataParams,
    ),
  ]);

  return {
    total: countRows[0]?.count ?? 0,
    rows: rows.map(mapUserListRow),
  };
}

export async function getUserRecord(id: number): Promise<UserRecord | null> {
  const row = await queryOne<UserRecordRow>(
    `select u.id, u.first_name, u.last_name, u.email, u.role, u.is_active,
            u.date_of_birth, u.created_at, u.updated_at,
            c.id as company_id, c.name as company_name, c.industry as company_industry,
            c.country as company_country
     from users u
     join companies c on c.id = u.company_id
     where u.id = $1`,
    [id],
  );
  return row ? mapUserRecordRow(row) : null;
}

export async function listCompanies(): Promise<Company[]> {
  return query<Company>(`select id, name from companies order by name asc`);
}

export async function emailExists(email: string, excludeUserId?: number): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    excludeUserId
      ? `select exists(select 1 from users where lower(email) = lower($1) and id <> $2) as exists`
      : `select exists(select 1 from users where lower(email) = lower($1)) as exists`,
    excludeUserId ? [email, excludeUserId] : [email],
  );
  return row?.exists ?? false;
}

export async function companyExists(companyId: number): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    `select exists(select 1 from companies where id = $1) as exists`,
    [companyId],
  );
  return row?.exists ?? false;
}

export async function getOrderStatusCounts(
  userId: number,
): Promise<Array<{ status: OrderStatus; count: number }>> {
  return query<{ status: OrderStatus; count: number }>(
    `select status, count(*)::int as count
     from orders
     where user_id = $1
     group by status`,
    [userId],
  );
}

// excludes cancelled orders - never fulfilled, shouldn't count as spend.
// order counts elsewhere (status totals) still include them, that's activity not revenue
export async function getOrderSpendAggregate(
  userId: number,
): Promise<{ orderCount: number; totalSpend: number }> {
  const row = await queryOne<{ order_count: number; total_spend: number }>(
    `select count(distinct o.id)::int as order_count,
            coalesce(sum(oi.quantity * oi.unit_price), 0)::float as total_spend
     from orders o
     join order_items oi on oi.order_id = o.id
     where o.user_id = $1 and o.status <> 'CANCELLED'`,
    [userId],
  );
  return { orderCount: row?.order_count ?? 0, totalSpend: row?.total_spend ?? 0 };
}

export async function getFavouriteCategory(userId: number): Promise<FavouriteCategory | null> {
  return queryOne<FavouriteCategory>(
    `select p.category, sum(oi.quantity * oi.unit_price)::float as spend
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.user_id = $1 and o.status <> 'CANCELLED'
     group by p.category
     order by spend desc
     limit 1`,
    [userId],
  );
}

export async function getMostPurchasedProduct(
  userId: number,
): Promise<MostPurchasedProduct | null> {
  return queryOne<MostPurchasedProduct>(
    `select p.id, p.name, sum(oi.quantity)::int as quantity
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.user_id = $1 and o.status <> 'CANCELLED'
     group by p.id, p.name
     order by quantity desc, p.name asc
     limit 1`,
    [userId],
  );
}

export async function getRecentOrders(userId: number, limit: number): Promise<RecentOrder[]> {
  return query<RecentOrder>(
    `select o.id, o.status, o.created_at as "createdAt",
            coalesce(sum(oi.quantity * oi.unit_price), 0)::float as total
     from orders o
     left join order_items oi on oi.order_id = o.id
     where o.user_id = $1
     group by o.id, o.status, o.created_at
     order by o.created_at desc
     limit $2`,
    [userId, limit],
  );
}

export async function getRecentNotes(userId: number, limit: number): Promise<UserNote[]> {
  return query<UserNote>(
    `select id, note, created_at as "createdAt"
     from user_notes
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );
}
