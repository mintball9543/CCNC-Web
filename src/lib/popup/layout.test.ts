import { describe, expect, it } from "vitest";
import { computePopupBox, isPopupInSchedule } from "./layout";

const desktop = { width: 1440, height: 900 };
const mobile = { width: 375, height: 700 };

describe("computePopupBox", () => {
  it("center 팝업은 화면 중앙에 배치된다", () => {
    const box = computePopupBox(
      { position: "center", left: 0, top: 0, width: 400, height: 500 },
      desktop,
    );
    expect(box).toMatchObject({ left: 520, top: 200, width: 400, height: 500 });
  });

  it("custom 팝업은 지정한 좌상단 좌표에 배치된다", () => {
    const box = computePopupBox(
      { position: "custom", left: 100, top: 120, width: 400, height: 300 },
      desktop,
    );
    expect(box).toMatchObject({ left: 100, top: 120, width: 400, height: 300 });
  });

  it("custom 좌표가 화면을 벗어나면 화면 안으로 보정된다", () => {
    const box = computePopupBox(
      { position: "custom", left: 1300, top: 850, width: 400, height: 300 },
      desktop,
    );
    expect(box.left).toBe(1040);
    expect(box.top).toBe(600);
  });

  it("모바일에서는 화면 너비에 맞춰 축소되고 중앙 정렬된다", () => {
    const box = computePopupBox(
      { position: "custom", left: 500, top: 100, width: 600, height: null },
      mobile,
    );
    expect(box.width).toBe(343);
    expect(box.left).toBe(16);
    expect(box.height).toBeNull();
  });
});

describe("isPopupInSchedule", () => {
  const now = new Date("2026-11-03T00:00:00Z");

  it("기간 미지정이면 노출", () => {
    expect(isPopupInSchedule({ startsAt: null, endsAt: null }, now)).toBe(true);
  });

  it("시작 전/종료 후에는 비노출", () => {
    expect(
      isPopupInSchedule({ startsAt: new Date("2026-11-04T00:00:00Z"), endsAt: null }, now),
    ).toBe(false);
    expect(
      isPopupInSchedule({ startsAt: null, endsAt: new Date("2026-11-02T00:00:00Z") }, now),
    ).toBe(false);
  });
});
