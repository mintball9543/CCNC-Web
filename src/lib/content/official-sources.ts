/**
 * 공식 통계 새 공표 확인 — 관리자 > 도표 관리를 열 때 공식 게시판 목록을 읽어,
 * 홈페이지 수치에 넣어 둔 자료보다 새 공표 글이 있으면 알린다. (수치는 사람이 확인해 코드에 넣는다)
 */

export const GIR_BOARD_URL =
  "https://www.gir.go.kr/home/board/list.do?maxPageItems=10&maxIndexPages=10&boardMasterId=2&menuId=36&pagerOffset=0";
const GIR_READ_URL = (boardId: number) =>
  `https://www.gir.go.kr/home/board/read.do?menuId=36&boardId=${boardId}&boardMasterId=2`;

export interface OfficialSource {
  key: string;
  /** 자료 이름 */
  label: string;
  /** 게시판 글 제목에서 이 자료의 공표 글을 찾는 규칙 */
  titlePattern: RegExp;
  /** 홈페이지 수치에 지금 반영된 공표 글 번호 (carbon-info.ts 의 출처와 같은 글) */
  appliedBoardId: number;
  appliedLabel: string;
  /** 새 공표가 나오면 고쳐야 할 관리자 자료 */
  affects: readonly string[];
}

export const OFFICIAL_SOURCES: readonly OfficialSource[] = [
  {
    key: "gir-regional",
    label: "지역 온실가스 인벤토리",
    titlePattern: /지역\s*온실가스\s*인벤토리.*공표/,
    appliedBoardId: 89,
    appliedLabel: "2025년 지역 온실가스 인벤토리(2010-2023)",
    affects: ["충청남도 부문별 총배출량 (배출 실적)", "충청남도 직접·간접 배출량"],
  },
  {
    key: "gir-national",
    label: "국가 온실가스 인벤토리",
    titlePattern: /국가\s*온실가스\s*인벤토리.*공표/,
    appliedBoardId: 91,
    appliedLabel: "2026년 국가 온실가스 인벤토리(1990-2024)",
    affects: ["국내 분야별 온실가스 배출량 비교", "국내 분야별 온실가스 배출량 표"],
  },
];

export interface BoardPost {
  boardId: number;
  title: string;
  /** YYYY-MM-DD */
  date: string;
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** GIR 게시판 목록 HTML → 글 목록 */
export function parseGirBoard(html: string): BoardPost[] {
  const posts: BoardPost[] = [];
  for (const tr of html.split(/<\/tr>/i)) {
    const link = tr.match(/<a[^>]+href="[^"]*[?&;]boardId=(\d+)[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    const date = tr.match(/<td[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/td>/);
    if (!link || !date) continue;
    posts.push({
      boardId: Number(link[1]),
      title: decode(link[2].replace(/<[^>]+>/g, "")),
      date: date[1],
    });
  }
  return posts;
}

export interface NewPublication {
  source: OfficialSource;
  post: BoardPost;
  url: string;
}

/** 지금 반영된 글보다 번호가 큰 공표 글 (자료마다 가장 최근 것 하나) */
export function findNewPublications(
  posts: BoardPost[],
  sources: readonly OfficialSource[] = OFFICIAL_SOURCES,
): NewPublication[] {
  return sources.flatMap((source) => {
    const newer = posts
      .filter((p) => source.titlePattern.test(p.title) && p.boardId > source.appliedBoardId)
      .sort((a, b) => b.boardId - a.boardId)[0];
    return newer ? [{ source, post: newer, url: GIR_READ_URL(newer.boardId) }] : [];
  });
}
