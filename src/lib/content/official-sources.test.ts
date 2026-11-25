import { describe, expect, it } from "vitest";
import { findNewPublications, parseGirBoard } from "./official-sources";

// 2026-11-25 GIR '국가·지역 온실가스 통계' 게시판 목록 일부 (공백 정리)
const row = (no: number, boardId: number, title: string, date: string) =>
  `<tr> <td> ${no} </td> <td class="tit"> <a href="/home/board/read.do?pagerOffset=0&amp;maxPageItems=10&amp;menuId=36&amp;boardId=${boardId}&amp;boardMasterId=2&amp;boardCategoryId=&amp;pagerOffset=0"> ${title} </a> </td> <td>기획총괄팀</td> <td>${date}</td> <td>4,800</td> </tr>`;
const TODAY = [
  row(77, 91, "2026년 국가 온실가스 인벤토리(1990-2024년) 공표 (`06, `96 IPCC 지침)", "2026-10-30"),
  row(76, 90, "2025 국가 온실가스 인벤토리(1990~2023) 보고서(NID)", "2026-05-29"),
  row(75, 89, "2025년 지역 온실가스 인벤토리(2010-2023) 공표", "2025-12-31"),
].join("\n");

describe("공식 통계 새 공표 확인", () => {
  it("게시판 목록에서 글 번호·제목·날짜를 읽는다", () => {
    expect(parseGirBoard(TODAY)).toEqual([
      {
        boardId: 91,
        title: "2026년 국가 온실가스 인벤토리(1990-2024년) 공표 (`06, `96 IPCC 지침)",
        date: "2026-10-30",
      },
      {
        boardId: 90,
        title: "2025 국가 온실가스 인벤토리(1990~2023) 보고서(NID)",
        date: "2026-05-29",
      },
      { boardId: 89, title: "2025년 지역 온실가스 인벤토리(2010-2023) 공표", date: "2025-12-31" },
    ]);
  });

  it("지금 반영된 자료뿐이면 알리지 않는다", () => {
    expect(findNewPublications(parseGirBoard(TODAY))).toEqual([]);
  });

  it("새 지역 인벤토리 공표 글이 올라오면 알린다 (보고서·속보치 글은 무시)", () => {
    const html =
      row(79, 95, "2026년 지역 온실가스 인벤토리(2010-2024) 공표", "2026-12-30") +
      row(78, 94, "[인포그래픽] 2026년도 3분기 에너지 분야 온실가스 속보치", "2026-12-20") +
      TODAY;
    const found = findNewPublications(parseGirBoard(html));
    expect(found.map((f) => [f.source.key, f.post.boardId, f.post.date])).toEqual([
      ["gir-regional", 95, "2026-12-30"],
    ]);
    expect(found[0].url).toContain("boardId=95");
  });
});
