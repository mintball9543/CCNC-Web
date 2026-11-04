import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminUsers, type AdminUserRow } from "@/lib/db/schema";

export async function findAdminByUsername(username: string): Promise<AdminUserRow | null> {
  return (
    (await db.query.adminUsers.findFirst({ where: eq(adminUsers.username, username) })) ?? null
  );
}

export async function touchAdminLogin(id: number): Promise<void> {
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
}

/** 대표 관리자 계정 (비밀번호만으로 로그인하는 단일 관리자 구조) */
export async function findPrimaryAdmin(): Promise<AdminUserRow | null> {
  return (await db.query.adminUsers.findFirst({ orderBy: (t, { asc }) => [asc(t.id)] })) ?? null;
}

export async function findAdminById(id: number): Promise<AdminUserRow | null> {
  return (await db.query.adminUsers.findFirst({ where: eq(adminUsers.id, id) })) ?? null;
}

export async function updateAdminPassword(id: number, passwordHash: string): Promise<void> {
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id));
}
