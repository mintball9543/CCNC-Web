import type { BoardKey } from "@/types";

/**
 * 캐시 태그 — 공개 화면 조회('use cache')와 관리자 변경(updateTag)이 같은 키를 사용한다.
 */
export const cacheTags = {
  popups: "popups",
  posts: (boardKey: BoardKey) => `posts:${boardKey}`,
  post: (id: number) => `post:${id}`,
  inquiries: "inquiries",
  inquiry: (id: number) => `inquiry:${id}`,
} as const;
