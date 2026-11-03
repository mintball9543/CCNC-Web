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
