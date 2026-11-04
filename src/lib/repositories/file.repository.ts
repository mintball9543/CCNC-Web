import "server-only";
import { and, asc, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { files, posts, type FileRow } from "@/lib/db/schema";
import { removeUpload } from "@/lib/uploads/storage";

/** 업로드 파일 데이터 접근 계층 */

export async function insertFile(values: typeof files.$inferInsert): Promise<FileRow> {
  const [row] = await db.insert(files).values(values).returning();
  return row;
}

export async function findFile(id: number): Promise<FileRow | null> {
  return (await db.query.files.findFirst({ where: eq(files.id, id) })) ?? null;
}

/** 파일과 연결된 게시글의 공개 여부 (연결 없으면 null) */
export async function findFileWithPostVisibility(id: number) {
  const row = await db
    .select({ file: files, isPublished: posts.isPublished })
    .from(files)
    .leftJoin(posts, eq(files.postId, posts.id))
    .where(eq(files.id, id))
    .get();
  return row ?? null;
}

export async function listPostAttachments(postId: number): Promise<FileRow[]> {
  return db
    .select()
    .from(files)
    .where(and(eq(files.postId, postId), eq(files.kind, "attachment")))
    .orderBy(asc(files.sortOrder), asc(files.id));
}

/**
 * 게시글 첨부파일 동기화 — ids 순서대로 연결하고, 목록에서 빠진 기존 첨부는 삭제한다.
 */
export async function syncPostAttachments(postId: number, ids: number[]): Promise<void> {
  const removed = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.postId, postId),
        eq(files.kind, "attachment"),
        ids.length ? notInArray(files.id, ids) : undefined,
      ),
    );
  for (const file of removed) await deleteFile(file);

  for (const [index, id] of ids.entries()) {
    await db
      .update(files)
      .set({ postId, sortOrder: index })
      .where(and(eq(files.id, id), eq(files.kind, "attachment")));
  }
}

/** 게시글 삭제 전 첨부파일 정리 */
export async function deletePostAttachments(postId: number): Promise<void> {
  const rows = await db.select().from(files).where(eq(files.postId, postId));
  for (const file of rows) await deleteFile(file);
}

export async function deleteFile(file: Pick<FileRow, "id" | "storageKey">): Promise<void> {
  await db.delete(files).where(eq(files.id, file.id));
  await removeUpload(file.storageKey);
}

export async function listFilesByIds(ids: number[]): Promise<FileRow[]> {
  if (ids.length === 0) return [];
  return db.select().from(files).where(inArray(files.id, ids));
}

/** 게시글에 연결되지 않은 첨부파일 (정리 대상 확인용) */
export async function listOrphanAttachments(): Promise<FileRow[]> {
  return db
    .select()
    .from(files)
    .where(and(isNull(files.postId), eq(files.kind, "attachment")));
}
