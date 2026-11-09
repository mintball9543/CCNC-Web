import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { boards, GALLERY_PAGE_SIZE, POSTS_PAGE_SIZE } from "@/lib/config/boards";
import { htmlToText } from "@/lib/content/sanitize";
import * as fileRepository from "@/lib/repositories/file.repository";
import * as postRepository from "@/lib/repositories/post.repository";
import { fileUrl } from "@/lib/uploads/url";
import type { BoardKey } from "@/types";

/** 공개 화면용 게시글 조회 (캐시됨 — 관리자 변경 시 updateTag 로 즉시 갱신) */

export async function getPublishedPosts(
  boardKey: BoardKey,
  {
    page = 1,
    category = null,
    keyword = null,
  }: { page?: number; category?: string | null; keyword?: string | null } = {},
) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts(boardKey));
  const pageSize = boards[boardKey].layout === "gallery" ? GALLERY_PAGE_SIZE : POSTS_PAGE_SIZE;
  return postRepository.listPosts({ boardKey, page, category, keyword, pageSize });
}

export async function getPublishedPost(boardKey: BoardKey, id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts(boardKey), cacheTags.post(id));
  return postRepository.findPost(boardKey, id);
}

/** 메인 최신글 — 요약문(본문 앞부분 텍스트)·첨부파일 여부 포함 */
export async function getLatestPosts(boardKey: BoardKey, limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts(boardKey));
  const rows = await postRepository.listLatestPostsWithExcerpt(boardKey, limit);
  return rows.map(({ contentHead, format, ...post }) => ({
    ...post,
    excerpt: (format === "html" ? htmlToText(contentHead) : contentHead.replace(/\s+/g, " ")).slice(
      0,
      120,
    ),
  }));
}

/** 게시글 첨부파일 (공개 화면) */
export async function getPostAttachments(postId: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.post(postId));
  const rows = await fileRepository.listPostAttachments(postId);
  return rows.map((f) => ({
    id: f.id,
    url: fileUrl(f.id),
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    kind: f.kind,
  }));
}

/** 메인 '활동 갤러리' — 대표 사진이 있는 최신 활동 갤러리 게시글 (상단 고정 우선) */
export async function getLatestActivityPhotos(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts("gallery"));
  const result = await postRepository.listPosts({ boardKey: "gallery", page: 1, pageSize: 30 });
  return result.items.filter((p) => p.thumbnailUrl).slice(0, limit);
}
