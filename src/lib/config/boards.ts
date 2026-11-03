import { BOARD_KEYS, type BoardDefinition, type BoardKey } from "@/types";

/** 게시판 정의 — 게시판 추가 시 여기와 src/types/board.ts 의 BOARD_KEYS 를 함께 수정 */
export const boards: Record<BoardKey, BoardDefinition> = {
  notice: {
    key: "notice",
    title: "공지사항",
    description: "센터 운영 및 사업 관련 공지사항입니다.",
  },
  "center-news": {
    key: "center-news",
    title: "센터소식",
    description: "센터의 활동 소식을 전해드립니다.",
  },
  press: {
    key: "press",
    title: "보도자료",
    description: "센터 관련 보도자료입니다.",
  },
  archive: {
    key: "archive",
    title: "자료실",
    description: "정책자료, 연구보고서, 온실가스 감축인지 예산 자료를 제공합니다.",
    categories: [
      { key: "policy", label: "정책자료" },
      { key: "report", label: "연구보고서" },
      { key: "budget", label: "감축인지예산" },
    ],
  },
};

export const boardList: BoardDefinition[] = BOARD_KEYS.map((key) => boards[key]);

export function isBoardKey(value: string): value is BoardKey {
  return (BOARD_KEYS as readonly string[]).includes(value);
}

export function getBoard(key: string): BoardDefinition | undefined {
  return isBoardKey(key) ? boards[key] : undefined;
}

export function getCategoryLabel(boardKey: BoardKey, categoryKey: string | null) {
  if (!categoryKey) return null;
  return boards[boardKey].categories?.find((c) => c.key === categoryKey)?.label ?? null;
}

export const POSTS_PAGE_SIZE = 10;
