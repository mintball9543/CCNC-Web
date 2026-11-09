import "server-only";
import { and, count, desc, eq, inArray, isNotNull, isNull, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inquiries, type InquiryRow, type NewInquiryRow } from "@/lib/db/schema";
import { maskName } from "@/lib/utils/format";
import type { Inquiry, InquirySummary, Paginated, PublicInquiryDetail } from "@/types";

/** 문의 데이터 접근 계층 */

function toSummary(
  row: Pick<InquiryRow, "id" | "title" | "authorName" | "isPrivate" | "answeredAt" | "createdAt">,
): InquirySummary {
  return {
    id: row.id,
    title: row.title,
    maskedAuthor: maskName(row.authorName),
    isPrivate: row.isPrivate,
    status: row.answeredAt ? "answered" : "pending",
    createdAt: row.createdAt,
  };
}

const summaryColumns = {
  id: inquiries.id,
  title: inquiries.title,
  authorName: inquiries.authorName,
  isPrivate: inquiries.isPrivate,
  answeredAt: inquiries.answeredAt,
  createdAt: inquiries.createdAt,
};

export async function listInquiries({
  page = 1,
  pageSize = 10,
  status,
  ownerKeyHash,
}: {
  page?: number;
  pageSize?: number;
  status?: "pending" | "answered";
  /** '본인 글 보기' — 이 브라우저에서 작성한 문의만 */
  ownerKeyHash?: string;
} = {}): Promise<Paginated<InquirySummary>> {
  const conditions: SQL[] = [];
  if (status === "pending") conditions.push(isNull(inquiries.answeredAt));
  if (status === "answered") conditions.push(isNotNull(inquiries.answeredAt));
  if (ownerKeyHash) conditions.push(eq(inquiries.ownerKeyHash, ownerKeyHash));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(summaryColumns)
      .from(inquiries)
      .where(where)
      .orderBy(desc(inquiries.createdAt), desc(inquiries.id))
      .limit(pageSize)
      .offset((Math.max(1, page) - 1) * pageSize),
    db.select({ total: count() }).from(inquiries).where(where),
  ]);

  return {
    items: rows.map(toSummary),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** 공개 상세 — 비공개 글은 본문/답변을 제외하고 반환 */
export async function findPublicInquiry(id: number): Promise<PublicInquiryDetail | null> {
  const row = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
  if (!row) return null;
  return {
    ...toSummary(row),
    content: row.isPrivate ? null : row.content,
    answer: row.isPrivate ? null : row.answer,
    answeredAt: row.isPrivate ? null : row.answeredAt,
    hasPassword: row.passwordHash !== null,
  };
}

/** 관리자/본인 확인 후 사용 — 비밀번호 해시 제외 전체 정보 */
export async function findInquiry(id: number): Promise<Inquiry | null> {
  const row = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
  if (!row) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ownerKeyHash, ...rest } = row;
  return { ...rest, hasPassword: passwordHash !== null };
}

export async function findInquiryPasswordHash(id: number): Promise<string | null> {
  const row = await db
    .select({ passwordHash: inquiries.passwordHash })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .get();
  return row?.passwordHash ?? null;
}

/** 작성자 본인 확인에 필요한 정보 (해시 포함 — 서버 내부 전용) */
export async function findInquiryAuth(id: number) {
  const row = await db
    .select({
      id: inquiries.id,
      title: inquiries.title,
      isPrivate: inquiries.isPrivate,
      passwordHash: inquiries.passwordHash,
      ownerKeyHash: inquiries.ownerKeyHash,
      answeredAt: inquiries.answeredAt,
    })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .get();
  return row ?? null;
}

export async function updateInquiryByAuthor(
  id: number,
  values: Pick<NewInquiryRow, "title" | "content" | "phone" | "isPrivate"> & {
    passwordHash?: string;
  },
): Promise<void> {
  // 답변 전 상태일 때만 수정 (동시에 답변이 등록된 경우 대비)
  await db
    .update(inquiries)
    .set(values)
    .where(and(eq(inquiries.id, id), isNull(inquiries.answeredAt)));
}

export async function deleteInquiryByAuthor(id: number): Promise<boolean> {
  const removed = await db
    .delete(inquiries)
    .where(and(eq(inquiries.id, id), isNull(inquiries.answeredAt)))
    .returning({ id: inquiries.id });
  return removed.length > 0;
}

export async function findInquiriesByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select({ id: inquiries.id, title: inquiries.title })
    .from(inquiries)
    .where(inArray(inquiries.id, ids));
}

export async function deleteInquiries(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(inquiries).where(inArray(inquiries.id, ids));
}

export async function insertInquiry(values: NewInquiryRow): Promise<number> {
  const [row] = await db.insert(inquiries).values(values).returning({ id: inquiries.id });
  return row.id;
}

export async function saveInquiryAnswer(
  id: number,
  answer: { text: string; answeredBy: string } | null,
): Promise<void> {
  await db
    .update(inquiries)
    .set(
      answer
        ? { answer: answer.text, answeredBy: answer.answeredBy, answeredAt: new Date() }
        : { answer: null, answeredBy: null, answeredAt: null },
    )
    .where(eq(inquiries.id, id));
}

export async function deleteInquiry(id: number): Promise<void> {
  await db.delete(inquiries).where(eq(inquiries.id, id));
}

export async function countPendingInquiries(): Promise<number> {
  return db.$count(inquiries, isNull(inquiries.answeredAt));
}

export async function markInquiryNotified(id: number): Promise<void> {
  await db.update(inquiries).set({ notifiedAt: new Date() }).where(eq(inquiries.id, id));
}
