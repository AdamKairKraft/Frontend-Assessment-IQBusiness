import "server-only";
import { Pool, types } from "pg";

// bigint/numeric come back as strings by default - fine to parse them,
// nothing here gets close to overflowing a JS number
types.setTypeParser(20, (value) => parseInt(value, 10));
types.setTypeParser(1700, (value) => parseFloat(value));
// keep dates as plain strings instead of pg's default Date - was getting
// date_of_birth off by a day depending on server timezone otherwise
types.setTypeParser(1082, (value) => value);

declare global {
  var __pgPool: Pool | undefined;
}

// cached on global so dev-mode hot reload doesn't spawn a new pool every save
export const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const result = await pool.query(text, params as unknown[]);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
