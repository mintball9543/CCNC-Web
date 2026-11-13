import { describe, expect, it } from "vitest";
import { mainNavigation } from "@/lib/config/navigation";
import {
  CENTER_HISTORY,
  COMMITTEE,
  FIELD_DUTIES,
  PLAN_FIELDS,
  PLAN_PROJECTS_2026,
  projectHref,
  projectsForField,
} from "./center-plan";

const fieldNumber = { policy: "1", information: "2", communication: "3", operation: "4" };

describe("2026년 사업", () => {
  it("4개 분야 11개 사업, 번호 중복 없음", () => {
    expect(PLAN_FIELDS).toHaveLength(4);
    expect(PLAN_PROJECTS_2026).toHaveLength(11);
    expect(new Set(PLAN_PROJECTS_2026.map((p) => p.code)).size).toBe(11);
  });

  it("사업 번호 앞자리가 분야와 일치하고, 분야 안에서 번호 순", () => {
    for (const p of PLAN_PROJECTS_2026) expect(p.code.split("-")[0]).toBe(fieldNumber[p.field]);
    for (const f of PLAN_FIELDS) {
      const codes = projectsForField(f.key).map((p) => p.code);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toEqual([...codes].sort());
    }
  });

  it("주요사업 메뉴 = 4개 분야, 같은 순서", () => {
    const business = mainNavigation.find((s) => s.key === "business")!;
    expect(business.items.map((i) => i.href)).toEqual(PLAN_FIELDS.map((f) => `/business/${f.key}`));
  });

  it("필수 항목이 비어 있지 않음", () => {
    for (const p of PLAN_PROJECTS_2026) {
      expect(p.purpose.length, p.code).toBeGreaterThan(0);
      expect(p.activities.length, p.code).toBeGreaterThan(0);
      expect(
        p.schedule.every((s) => s.items.length > 0),
        p.code,
      ).toBe(true);
    }
    for (const f of PLAN_FIELDS) expect(FIELD_DUTIES[f.key].length).toBeGreaterThan(0);
  });

  it("연혁 7건·운영위원 9명", () => {
    expect(CENTER_HISTORY).toHaveLength(7);
    expect(COMMITTEE.members).toHaveLength(9);
  });

  it("사업 상세 주소", () => {
    expect(projectHref({ field: "information", code: "2-1" })).toBe(
      "/business/information#project-2-1",
    );
  });
});
