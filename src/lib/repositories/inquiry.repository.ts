import "server-only";
import { count, desc, eq, isNotNull, isNull } from "drizzle-orm";
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
}: {
  page?: number;
  pageSize?: number;
  status?: "pending" | "answered";
} = {}): Promise<Paginated<InquirySummary>> {
  const where =
    status === "pending"
      ? isNull(inquiries.answeredAt)
      : status === "answered"
        ? isNotNull(inquiries.answeredAt)
        : undefined;

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
  };
}

/** 관리자/본인 확인 후 사용 — 비밀번호 해시 제외 전체 정보 */
export async function findInquiry(id: number): Promise<Inquiry | null> {
  const row = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
  if (!row) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = row;
  return rest;
}

export async function findInquiryPasswordHash(id: number): Promise<string | null> {
  const row = await db
    .select({ passwordHash: inquiries.passwordHash })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .get();
  return row?.passwordHash ?? null;
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
