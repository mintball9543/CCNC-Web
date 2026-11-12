import { describe, expect, it } from "vitest";
import { canScroll, nextScrollLeft } from "./carousel-scroll";

// 보이는 폭 1000, 카드 7장(1장 200 + 간격 12) → 전체 1472, 최대 위치 472
const base = { clientWidth: 1000, scrollWidth: 1472, step: 212 };

describe("canScroll", () => {
  it("한 줄에 다 들어가면 넘길 필요 없음", () => {
    expect(canScroll({ clientWidth: 1000, scrollWidth: 1000 })).toBe(false);
    expect(canScroll({ clientWidth: 1000, scrollWidth: 1001.5 })).toBe(false);
  });
  it("넘치면 넘겨볼 수 있음", () => {
    expect(canScroll({ clientWidth: 1000, scrollWidth: 1472 })).toBe(true);
  });
});

describe("nextScrollLeft", () => {
  it("다음: 한 칸씩", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 0 }, 1)).toBe(212);
  });
  it("다음: 끝을 넘지 않음", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 424 }, 1)).toBe(472);
  });
  it("다음: 끝에서는 처음으로", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 472 }, 1)).toBe(0);
    expect(nextScrollLeft({ ...base, scrollLeft: 471 }, 1)).toBe(0);
  });
  it("이전: 한 칸씩, 0 아래로 내려가지 않음", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 472 }, -1)).toBe(260);
    expect(nextScrollLeft({ ...base, scrollLeft: 100 }, -1)).toBe(0);
  });
  it("이전: 처음에서는 마지막으로", () => {
    expect(nextScrollLeft({ ...base, scrollLeft: 0 }, -1)).toBe(472);
  });
  it("넘칠 내용이 없으면 항상 0", () => {
    expect(
      nextScrollLeft({ clientWidth: 1000, scrollWidth: 1000, step: 212, scrollLeft: 0 }, 1),
    ).toBe(0);
  });
});
