import { describe, expect, it } from "vitest";
import { departmentsOf, hasMultipleDepartments } from "./org-departments";

const m = (...departments: string[]) => departments.map((department) => ({ department }));

describe("departmentsOf", () => {
  it("빈 값을 빼고 중복 없이 반환한다", () => {
    expect(departmentsOf(m("정책지원팀", "", " 정책지원팀 ", "운영위원회"))).toEqual([
      "정책지원팀",
      "운영위원회",
    ]);
  });
});

describe("hasMultipleDepartments", () => {
  it("소속이 없거나 하나뿐이면 false", () => {
    expect(hasMultipleDepartments(m())).toBe(false);
    expect(hasMultipleDepartments(m("", ""))).toBe(false);
    expect(hasMultipleDepartments(m("센터", "센터"))).toBe(false);
  });
  it("서로 다른 소속이 둘 이상이면 true", () => {
    expect(hasMultipleDepartments(m("정책지원팀", "운영위원회"))).toBe(true);
  });
});
