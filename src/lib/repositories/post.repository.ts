import "server-only";
import { and, count, desc, eq, exists, inArray, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { files, posts, postViewSeen, type NewPostRow, type PostRow } from "@/lib/db/schema";
import { likePattern, splitSearchTerms } from "@/lib/search/terms";
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

/** 검색어 조건 — 띄어쓰기로 나눈 조각을 모두 (제목 또는 본문에) 포함. %·_ 는 글자 그대로 찾는다 */
export function keywordCondition(keyword: string | null | undefined): SQL | undefined {
  const terms = splitSearchTerms(keyword);
  if (terms.length === 0) return undefined;
  return and(
    ...terms.map((term) => {
      const pattern = likePattern(term);
      return or(
        sql`${posts.title} like ${pattern} escape '\\'`,
        sql`${posts.content} like ${pattern} escape '\\'`,
      );
    }),
  );
}

const summaryColumns = {
  id: posts.id,
  boardKey: posts.boardKey,
  category: posts.category,
  title: posts.title,
  author: posts.author,
  isPinned: posts.isPinned,
  publishedAt: posts.publishedAt,
  thumbnailUrl: posts.thumbnailUrl,
  viewCount: posts.viewCount,
};

export async function listPosts(query: PostListQuery): Promise<Paginated<PostSummary>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 10;

  const where = and(
    eq(posts.boardKey, query.boardKey),
    query.publishedOnly === false ? undefined : eq(posts.isPublished, true),
    query.category ? eq(posts.category, query.category) : undefined,
    keywordCondition(query.keyword),
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(summaryColumns)
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
      ...summaryColumns,
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

export interface PostSearchQuery {
  keyword: string;
  /** 검색할 게시판 (공개 메뉴에 보이는 게시판) */
  boardKeys: BoardKey[];
  /** 한 게시판만 보기 (없으면 전체) */
  boardKey?: BoardKey | null;
  page?: number;
  pageSize?: number;
}

/**
 * 통합 검색 — 여러 게시판의 게시된 글을 최신순으로 찾고, 게시판별 건수도 함께 돌려준다.
 * 본문(content)은 요약문을 만들 수 있도록 그대로 포함한다.
 */
export async function searchPublishedPosts(query: PostSearchQuery) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 10;
  const condition = keywordCondition(query.keyword);
  const boardKeys = query.boardKey
    ? query.boardKeys.filter((key) => key === query.boardKey)
    : query.boardKeys;
  if (!condition || boardKeys.length === 0) {
    return { items: [], total: 0, page: 1, pageSize, totalPages: 1, counts: {} };
  }

  const base = and(eq(posts.isPublished, true), condition);
  const where = and(base, inArray(posts.boardKey, boardKeys));
  const [rows, countRows] = await Promise.all([
    db
      .select({ ...summaryColumns, content: posts.content, format: posts.format })
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ boardKey: posts.boardKey, total: count() })
      .from(posts)
      .where(and(base, inArray(posts.boardKey, query.boardKeys)))
      .groupBy(posts.boardKey),
  ]);

  const counts: Partial<Record<BoardKey, number>> = Object.fromEntries(
    countRows.map((r) => [r.boardKey, r.total]),
  );
  const total = boardKeys.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
  return {
    items: rows.map((row) => ({ ...row, boardKey: row.boardKey as BoardKey })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts,
  };
}

export interface PostViewResult {
  /** 현재 조회수 */
  views: number;
  boardKey: BoardKey;
  /** 이번 요청으로 조회수가 올랐는지 */
  counted: boolean;
}

/**
 * 게시글 조회 1건 기록 — 같은 접속자(해시)는 하루 한 번만 조회수를 올린다.
 * 게시된 글만 센다. 글이 없거나 비공개면 null.
 */
export async function recordPostView(
  postId: number,
  day: string,
  hash: string,
  { count: shouldCount = true } = {},
): Promise<PostViewResult | null> {
  return db.transaction(async (tx) => {
    const [post] = await tx
      .select({ viewCount: posts.viewCount, boardKey: posts.boardKey })
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.isPublished, true)));
    if (!post) return null;
    const boardKey = post.boardKey as BoardKey;
    const unchanged = { views: post.viewCount, boardKey, counted: false };
    if (!shouldCount) return unchanged;

    const inserted = await tx
      .insert(postViewSeen)
      .values({ day, postId, hash })
      .onConflictDoNothing()
      .returning({ day: postViewSeen.day });
    if (inserted.length === 0) return unchanged;

    const [updated] = await tx
      .update(posts)
      // updatedAt 은 '내용 수정' 시각이므로 조회로는 바꾸지 않는다 ($onUpdate 덮어쓰기)
      .set({ viewCount: sql`${posts.viewCount} + 1`, updatedAt: sql`${posts.updatedAt}` })
      .where(eq(posts.id, postId))
      .returning({ viewCount: posts.viewCount });
    await tx.delete(postViewSeen).where(lt(postViewSeen.day, day));
    return { views: updated.viewCount, boardKey, counted: true };
  });
}
