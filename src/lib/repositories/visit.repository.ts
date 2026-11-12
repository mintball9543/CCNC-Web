import "server-only";
import { and, gte, lt, lte, min, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { visitDaily, visitSeen } from "@/lib/db/schema";
import type { VisitBucket, VisitCount } from "@/lib/visits/stats";

/** 방문 1건 기록 — 그날 처음 보는 접속자면 방문자 수도 1 늘린다 */
export async function recordVisit(day: string, hash: string): Promise<void> {
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(visitSeen)
      .values({ day, hash })
      .onConflictDoNothing()
      .returning({ day: visitSeen.day });
    const isNew = inserted.length > 0;
    await tx
      .insert(visitDaily)
      .values({ day, visitors: isNew ? 1 : 0, pageViews: 1 })
      .onConflictDoUpdate({
        target: visitDaily.day,
        set: {
          visitors: sql`${visitDaily.visitors} + ${isNew ? 1 : 0}`,
          pageViews: sql`${visitDaily.pageViews} + 1`,
        },
      });
    if (isNew) await tx.delete(visitSeen).where(lt(visitSeen.day, day));
  });
}

const totals = {
  visitors: sql<number>`coalesce(${sum(visitDaily.visitors)}, 0)`.mapWith(Number),
  pageViews: sql<number>`coalesce(${sum(visitDaily.pageViews)}, 0)`.mapWith(Number),
};

/** 기간 합계 (from·to 는 YYYY-MM-DD, 양 끝 포함 / 생략 시 전체) */
export async function sumVisits(from?: string, to?: string): Promise<VisitCount> {
  const conditions = [from && gte(visitDaily.day, from), to && lte(visitDaily.day, to)].filter(
    (c) => !!c,
  );
  const [row] = await db
    .select(totals)
    .from(visitDaily)
    .where(conditions.length ? and(...conditions) : undefined);
  return row ?? { visitors: 0, pageViews: 0 };
}

/** 일(10)·월(7)·연(4) 단위 묶음 — 키 길이만큼 날짜 앞부분으로 묶는다 */
export async function groupVisits(keyLength: 4 | 7 | 10, from: string): Promise<VisitBucket[]> {
  const key = sql<string>`substr(${visitDaily.day}, 1, ${keyLength})`;
  return db
    .select({ key, ...totals })
    .from(visitDaily)
    .where(gte(visitDaily.day, from))
    .groupBy(key)
    .orderBy(key);
}

/** 첫 기록 연도 (기록이 없으면 null) */
export async function firstVisitYear(): Promise<string | null> {
  const [row] = await db.select({ first: min(visitDaily.day) }).from(visitDaily);
  return row?.first ? row.first.slice(0, 4) : null;
}
