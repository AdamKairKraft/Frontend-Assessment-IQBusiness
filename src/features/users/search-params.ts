export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const MAX_PAGE_SIZE = 100;

export const SORT_FIELDS = ["name", "email", "created", "company", "role"] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";

export interface UsersSearchParams {
  page: number;
  pageSize: number;
  search: string;
  sort: SortField;
  direction: SortDirection;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = raw === undefined ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function parseUsersSearchParams(sp: RawSearchParams): UsersSearchParams {
  const page = clampInt(first(sp.page), 1, 1, Number.MAX_SAFE_INTEGER);
  const pageSize = clampInt(first(sp.pageSize), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const rawSearch = first(sp.search) ?? "";
  const search = rawSearch.trim().slice(0, 120);

  const rawSort = first(sp.sort);
  const sort = (SORT_FIELDS as readonly string[]).includes(rawSort ?? "")
    ? (rawSort as SortField)
    : "name";

  const rawDirection = first(sp.direction);
  const direction: SortDirection = rawDirection === "desc" ? "desc" : "asc";

  return { page, pageSize, search, sort, direction };
}

// drops defaults so the URL stays clean (no ?page=1&sort=name&direction=asc etc)
export function buildUsersQuery(
  overrides: Partial<UsersSearchParams>,
  current: UsersSearchParams,
): Record<string, string> {
  const next = { ...current, ...overrides };
  const query: Record<string, string> = {};
  if (next.page !== 1) query.page = String(next.page);
  if (next.pageSize !== DEFAULT_PAGE_SIZE) query.pageSize = String(next.pageSize);
  if (next.search) query.search = next.search;
  if (next.sort !== "name") query.sort = next.sort;
  if (next.direction !== "asc") query.direction = next.direction;
  return query;
}
