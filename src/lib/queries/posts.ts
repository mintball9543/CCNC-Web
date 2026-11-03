import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { POSTS_PAGE_SIZE } from "@/lib/config/boards";
import * as postRepository from "@/lib/repositories/post.repository";
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
  return postRepository.listPosts({ boardKey, page, category, keyword, pageSize: POSTS_PAGE_SIZE });
}

export async function getPublishedPost(boardKey: BoardKey, id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts(boardKey), cacheTags.post(id));
  return postRepository.findPost(boardKey, id);
}

export async function getLatestPosts(boardKey: BoardKey, limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.posts(boardKey));
  return postRepository.listLatestPosts(boardKey, limit);
}
