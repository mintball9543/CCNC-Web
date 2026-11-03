import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { popups, type NewPopupRow } from "@/lib/db/schema";
import type { Popup, PublicPopup } from "@/types";

/** 팝업 데이터 접근 계층 */

export async function listAllPopups(): Promise<Popup[]> {
  return db
    .select()
    .from(popups)
    .orderBy(desc(popups.isActive), asc(popups.sortOrder), desc(popups.id));
}

/** 활성 팝업 (게시 기간 필터링은 클라이언트에서 현재 시각 기준으로 수행) */
export async function listActivePopups(): Promise<PublicPopup[]> {
  return db
    .select({
      id: popups.id,
      title: popups.title,
      content: popups.content,
      imageUrl: popups.imageUrl,
      imageAlt: popups.imageAlt,
      linkUrl: popups.linkUrl,
      position: popups.position,
      left: popups.left,
      top: popups.top,
      width: popups.width,
      height: popups.height,
      startsAt: popups.startsAt,
      endsAt: popups.endsAt,
    })
    .from(popups)
    .where(eq(popups.isActive, true))
    .orderBy(asc(popups.sortOrder), desc(popups.id));
}

export async function findPopup(id: number): Promise<Popup | null> {
  return (await db.query.popups.findFirst({ where: eq(popups.id, id) })) ?? null;
}

export async function insertPopup(values: NewPopupRow): Promise<number> {
  const [row] = await db.insert(popups).values(values).returning({ id: popups.id });
  return row.id;
}

export async function updatePopup(id: number, values: Partial<NewPopupRow>): Promise<void> {
  await db.update(popups).set(values).where(eq(popups.id, id));
}

export async function deletePopup(id: number): Promise<void> {
  await db.delete(popups).where(eq(popups.id, id));
}
