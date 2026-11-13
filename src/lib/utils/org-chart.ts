import type { OrgMember } from "@/types";

export interface OrgTeam {
  /** 팀 이름 (구성원의 소속) */
  name: string;
  members: OrgMember[];
}

export interface OrgChart {
  /** 센터장 등 최상단 */
  heads: OrgMember[];
  /** 센터장 바로 아래 직속 (소속이 비어 있는 직원, 예: 사무국장) */
  direct: OrgMember[];
  /** 팀별 구성원 — 목록에 처음 나온 순서 */
  teams: OrgTeam[];
  /** 공동 연구(지원) — 연구원 겸직 인력 */
  support: OrgMember[];
}

/**
 * 조직도 구성원을 그림의 칸으로 나눈다.
 * - 구분이 '공동 연구(지원)'이면 왼쪽 지원 상자
 * - 센터 직원 중 '최상단' 표시 → 센터장 줄, 소속이 비어 있으면 직속, 소속이 있으면 팀
 * 입력은 정렬된 목록(최상단 → 정렬 순서 → 등록 순)이라고 가정한다.
 */
export function buildOrgChart(members: OrgMember[]): OrgChart {
  const chart: OrgChart = { heads: [], direct: [], teams: [], support: [] };
  const teamIndex = new Map<string, OrgTeam>();
  for (const m of members) {
    if (m.kind === "support") {
      chart.support.push(m);
    } else if (m.isHead) {
      chart.heads.push(m);
    } else if (!m.department.trim()) {
      chart.direct.push(m);
    } else {
      const name = m.department.trim();
      let team = teamIndex.get(name);
      if (!team) {
        team = { name, members: [] };
        teamIndex.set(name, team);
        chart.teams.push(team);
      }
      team.members.push(m);
    }
  }
  return chart;
}

/** 담당 업무(여러 줄 입력)를 항목으로 나눈다 */
export function dutyLines(duties: string): string[] {
  return duties
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s·•\-ㆍ]+/, "").trim())
    .filter(Boolean);
}

/** 운영위원회 인원 안내 — 센터장을 제외한 인원 ('센터장 외 8인') */
export function committeeSizeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? "1인 구성" : `센터장 외 ${count - 1}인 구성`;
}
