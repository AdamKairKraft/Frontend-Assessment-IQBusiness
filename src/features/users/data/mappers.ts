import "server-only";
import type { UserListItem, UserRecord } from "../types";

export interface UserListRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserListItem["role"];
  is_active: boolean;
  created_at: string;
  company_name: string;
}

export function mapUserListRow(row: UserListRow): UserListItem {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    companyName: row.company_name,
  };
}

export interface UserRecordRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRecord["role"];
  is_active: boolean;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  company_id: number;
  company_name: string;
  company_industry: string;
  company_country: string;
}

export function mapUserRecordRow(row: UserRecordRow): UserRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    dateOfBirth: row.date_of_birth,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    companyId: row.company_id,
    companyName: row.company_name,
    companyIndustry: row.company_industry,
    companyCountry: row.company_country,
  };
}
