import { describe, expect, it } from "vitest";
import { CHUNGNAM_TARGETS_DATA } from "./carbon-info";
import { CENTER_HISTORY, CENTER_VISION } from "./center-plan";
import { GREETING } from "./greeting";

const text = [
  ...GREETING.paragraphs,
  ...GREETING.commitments.map((c) => c.text),
  ...GREETING.closing,
].join("\n");

describe("센터장 인사말", () => {
  it("충남 감축 목표가 '충청남도 탄소중립 목표' 자료와 같다", () => {
    const at = (year: string) =>
      CHUNGNAM_TARGETS_DATA.rows.find((r) => r.label === year)?.values[0];
    expect(at("2018")).toBe(0);
    expect(text).toContain(`2030년까지 온실가스를 2018년 대비 ${at("2030")}% 줄이고`);
    expect(at("2045")).toBe(100);
    expect(text).toContain("2045년 탄소중립");
  });

  it("센터 비전과 현 도정 슬로건을 인용한다", () => {
    expect(text).toContain(`‘${CENTER_VISION.statement}’`);
    expect(text).toContain("‘통(通)하는 충남, 도민과 함께’");
    expect(text).not.toContain("힘쎈");
  });

  it("지정·개소 시기가 연혁과 같다", () => {
    expect(
      CENTER_HISTORY.some((h) => h.date === "2026. 07." && h.text.includes("충남연구원 지정")),
    ).toBe(true);
    expect(CENTER_HISTORY.some((h) => h.date === "2026. 11." && h.text.includes("개소식"))).toBe(
      true,
    );
    expect(text).toContain("2026년 7월 충남연구원이 지정되어, 같은 해 11월 문을 열었습니다");
  });
});
