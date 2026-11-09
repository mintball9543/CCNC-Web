import "server-only";
import { and, count, desc, eq, exists, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { files, posts, type NewPostRow, type PostRow } from "@/lib/db/schema";
import type { BoardKey, Paginated, Post, PostSummary } from "@/types";

/** 게시글 데이터 접근 계층 — Next.js 캐시/인증과 무관한 순수 DB 로직 */

export interface PostListQuery {
  boardKey: BoardKey;
  page?: number;
  pageSize?: number;
  category?: string | null;
  keyword?: string | null;
  /** false 면 미게시 글 포함 (관리자) */
  publishedOnly?: boolean;
}

function toPost(row: PostRow): Post {
  return { ...row, boardKey: row.boardKey as BoardKey };
}

export async function listPosts(query: PostListQuery): Promise<Paginated<PostSummary>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 10;
  const keyword = query.keyword?.trim();

  const where = and(
    eq(posts.boardKey, query.boardKey),
    query.publishedOnly === false ? undefined : eq(posts.isPublished, true),
    query.category ? eq(posts.category, query.category) : undefined,
    keyword
      ? or(like(posts.title, `%${keyword}%`), like(posts.content, `%${keyword}%`))
      : undefined,
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        boardKey: posts.boardKey,
        category: posts.category,
        title: posts.title,
        author: posts.author,
        isPinned: posts.isPinned,
        publishedAt: posts.publishedAt,
        thumbnailUrl: posts.thumbnailUrl,
      })
      .from(posts)
      .where(where)
      .orderBy(desc(posts.isPinned), desc(posts.publishedAt), desc(posts.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(posts).where(where),
  ]);

  return {
    items: rows.map((row) => ({ ...row, boardKey: row.boardKey as BoardKey })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findPost(
  boardKey: BoardKey,
  id: number,
  { publishedOnly = true } = {},
): Promise<Post | null> {
  const row = await db.query.posts.findFirst({
    where: and(
      eq(posts.id, id),
      eq(posts.boardKey, boardKey),
      publishedOnly ? eq(posts.isPublished, true) : undefined,
    ),
  });
  return row ? toPost(row) : null;
}

export async function listLatestPosts(boardKey: BoardKey, limit = 5): Promise<PostSummary[]> {
  const result = await listPosts({ boardKey, page: 1, pageSize: limit });
  return result.items;
}

/** 메인 위젯용 최신글 — 본문 앞부분(요약문 재료)과 첨부파일 여부 포함 */
export async function listLatestPostsWithExcerpt(boardKey: BoardKey, limit = 5) {
  const rows = await db
    .select({
      id: posts.id,
      boardKey: posts.boardKey,
      category: posts.category,
      title: posts.title,
      author: posts.author,
      isPinned: posts.isPinned,
      publishedAt: posts.publishedAt,
      thumbnailUrl: posts.thumbnailUrl,
      contentHead: sql<string>`substr(${posts.content}, 1, 800)`,
      format: posts.format,
      hasAttachment: exists(
        db
          .select({ one: sql`1` })
          .from(files)
          .where(and(eq(files.postId, posts.id), eq(files.kind, "attachment"))),
      ),
    })
    .from(posts)
    .where(and(eq(posts.boardKey, boardKey), eq(posts.isPublished, true)))
    .orderBy(desc(posts.isPinned), desc(posts.publishedAt), desc(posts.id))
    .limit(limit);
  return rows.map((row) => ({
    ...row,
    boardKey: row.boardKey as BoardKey,
    hasAttachment: Boolean(row.hasAttachment),
  }));
}

/** 선택 삭제용 — 해당 게시판에 속한 글만 반환 */
export async function findPostsByIds(boardKey: BoardKey, ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(and(eq(posts.boardKey, boardKey), inArray(posts.id, ids)));
}

export async function insertPost(values: NewPostRow): Promise<number> {
  const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
  return row.id;
}

export async function updatePost(id: number, values: Partial<NewPostRow>): Promise<void> {
  await db.update(posts).set(values).where(eq(posts.id, id));
}

export async function deletePost(id: number): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}

export async function countPostsByBoard(): Promise<Record<string, number>> {
  const rows = await db
    .select({ boardKey: posts.boardKey, total: count() })
    .from(posts)
    .groupBy(posts.boardKey);
  return Object.fromEntries(rows.map((r) => [r.boardKey, r.total]));
}

/** 메인 비주얼에서 고를 수 있는 활동 갤러리 게시글 (대표 사진이 있는 게시 글) */
export async function listGalleryPicks(limit = 100) {
  const rows = await db
    .select({ id: posts.id, title: posts.title, thumbnailUrl: posts.thumbnailUrl })
    .from(posts)
    .where(and(eq(posts.boardKey, "gallery"), eq(posts.isPublished, true)))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit);
  return rows.filter(
    (r): r is { id: number; title: string; thumbnailUrl: string } => r.thumbnailUrl !== null,
  );
}
