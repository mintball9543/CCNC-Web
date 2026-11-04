/** 게시판 도메인 타입 */
export const BOARD_KEYS = ["notice", "center-news", "press", "archive"] as const;
export type BoardKey = (typeof BOARD_KEYS)[number];

export interface BoardCategory {
  key: string;
  label: string;
}

export interface BoardDefinition {
  key: BoardKey;
  title: string;
  description: string;
  /** 카테고리 분류가 있는 게시판(자료실 등) */
  categories?: BoardCategory[];
  /** list: 표 형식 / gallery: 대표 사진 카드 형식 */
  layout: "list" | "gallery";
}

export interface Post {
  id: number;
  boardKey: BoardKey;
  category: string | null;
  title: string;
  content: string;
  format: "text" | "html";
  thumbnailUrl: string | null;
  author: string;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PostSummary = Pick<
  Post,
  "id" | "boardKey" | "category" | "title" | "author" | "isPinned" | "publishedAt" | "thumbnailUrl"
>;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
