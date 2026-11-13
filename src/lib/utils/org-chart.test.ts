import { describe, expect, it } from "vitest";
import type { OrgMember } from "@/types";
import { buildOrgChart, committeeSizeLabel, dutyLines } from "./org-chart";

let id = 0;
const m = (over: Partial<OrgMember>): OrgMember => ({
  id: ++id,
  department: "",
  position: "연구원",
  name: "홍길동",
  duties: "",
  phone: null,
  email: null,
  kind: "staff",
  isHead: false,
  isVisible: true,
  sortOrder: 0,
  ...over,
});

describe("buildOrgChart", () => {
  it("센터장·직속·팀·지원으로 나눈다", () => {
    const chart = buildOrgChart([
      m({ name: "센터장", isHead: true }),
      m({ name: "사무국장" }),
      m({ name: "A", department: "정책연구" }),
      m({ name: "B", department: "정보관리" }),
      m({ name: "C", department: "정책연구" }),
      m({ name: "겸직", kind: "support", department: "정책연구" }),
    ]);
    expect(chart.heads.map((x) => x.name)).toEqual(["센터장"]);
    expect(chart.direct.map((x) => x.name)).toEqual(["사무국장"]);
    expect(chart.teams.map((t) => t.name)).toEqual(["정책연구", "정보관리"]);
    expect(chart.teams[0].members.map((x) => x.name)).toEqual(["A", "C"]);
    expect(chart.support.map((x) => x.name)).toEqual(["겸직"]);
  });

  it("팀 이름 앞뒤 공백은 같은 팀으로 본다", () => {
    const chart = buildOrgChart([m({ department: "센터운영" }), m({ department: " 센터운영 " })]);
    expect(chart.teams).toHaveLength(1);
    expect(chart.teams[0].members).toHaveLength(2);
  });

  it("지원 인력은 센터장 표시여도 팀에 들어가지 않는다", () => {
    const chart = buildOrgChart([m({ kind: "support", isHead: true })]);
    expect(chart.heads).toHaveLength(0);
    expect(chart.support).toHaveLength(1);
  });

  it("빈 목록", () => {
    expect(buildOrgChart([])).toEqual({ heads: [], direct: [], teams: [], support: [] });
  });
});

describe("dutyLines", () => {
  it("줄 단위로 나누고 글머리 기호를 걷어낸다", () => {
    expect(dutyLines("· 예산 관리\r\n- 회계\n\n  홍보 ")).toEqual(["예산 관리", "회계", "홍보"]);
  });
  it("빈 값", () => {
    expect(dutyLines("")).toEqual([]);
  });
});

describe("committeeSizeLabel", () => {
  it("센터장 외 N인", () => {
    expect(committeeSizeLabel(9)).toBe("센터장 외 8인 구성");
    expect(committeeSizeLabel(1)).toBe("1인 구성");
    expect(committeeSizeLabel(0)).toBeNull();
  });
});
