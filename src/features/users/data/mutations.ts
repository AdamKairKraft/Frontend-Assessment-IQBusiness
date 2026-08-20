import "server-only";
import { query, queryOne } from "@/lib/db";
import type { UserFormValues } from "../validation";

export async function createUser(input: UserFormValues): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `insert into users (first_name, last_name, email, company_id, role, date_of_birth, is_active)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id`,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.companyId,
      input.role,
      input.dateOfBirth,
      input.isActive,
    ],
  );
  if (!row) throw new Error("Failed to create user");
  return row.id;
}

export async function updateUser(id: number, input: UserFormValues): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `update users
     set first_name = $1, last_name = $2, email = $3, company_id = $4,
         role = $5, date_of_birth = $6, is_active = $7, updated_at = now()
     where id = $8
     returning id`,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.companyId,
      input.role,
      input.dateOfBirth,
      input.isActive,
      id,
    ],
  );
  return rows.length > 0;
}

// hard delete - orders/order_items/user_notes cascade from users per the
// supplied schema, so this takes a user's order history with it. a real app
// with financial records would probably soft-delete instead
export async function deleteUser(id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(`delete from users where id = $1 returning id`, [id]);
  return rows.length > 0;
}
