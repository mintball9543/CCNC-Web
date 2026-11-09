import { and, count, desc, eq, lt, max, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/lib/db/factory";
import { adminAuditLogs } from "@/lib/db/schema";
import type { AuditCategory } from "@/lib/audit/labels";

/**
 * 관리자 작업 기록 데이터 접근 계층.
 * proxy(별도 실행 환경)에서도 쓰므로 server-only/db 싱글턴에 의존하지 않고 db 를 인자로 받는다.
 */

export type NewAuditLog = typeof adminAuditLogs.$inferInsert;

export async function insertAuditLog(db: Database, values: NewAuditLog): Promise<void> {
  await db.insert(adminAuditLogs).values(values);
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  ip?: string | null;
  category?: AuditCategory | null;
}

export async function listAuditLogs(db: Database, query: AuditLogQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 50;
  const conditions: SQL[] = [];
  if (query.ip) conditions.push(eq(adminAuditLogs.ip, query.ip));
  if (query.category) conditions.push(eq(adminAuditLogs.category, query.category));
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(adminAuditLogs)
      .where(where)
      .orderBy(desc(adminAuditLogs.createdAt), desc(adminAuditLogs.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(adminAuditLogs).where(where),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** IP 별 접속 요약 (최근 days 일) */
export async function summarizeIps(db: Database, days: number, limit = 20) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db
    .select({
      ip: adminAuditLogs.ip,
      total: count(),
      changes: sql<number>`sum(case when ${adminAuditLogs.category} = 'change' then 1 else 0 end)`,
      failures: sql<number>`sum(case when ${adminAuditLogs.action} in ('auth.login_failed', 'auth.login_blocked') then 1 else 0 end)`,
      lastSeen: max(adminAuditLogs.createdAt),
    })
    .from(adminAuditLogs)
    .where(sql`${adminAuditLogs.createdAt} >= ${Math.floor(since.getTime() / 1000)}`)
    .groupBy(adminAuditLogs.ip)
    .orderBy(desc(max(adminAuditLogs.createdAt)))
    .limit(limit);
}

/** 보존 기간이 지난 기록 삭제 */
export async function pruneAuditLogs(db: Database, before: Date): Promise<void> {
  await db.delete(adminAuditLogs).where(lt(adminAuditLogs.createdAt, before));
}
