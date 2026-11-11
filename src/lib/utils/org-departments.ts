/** 등록된 구성원의 소속(팀·부서) 목록 — 빈 값은 제외하고 중복을 없앤다 */
export function departmentsOf(members: { department: string }[]): string[] {
  return [...new Set(members.map((m) => m.department.trim()).filter(Boolean))];
}

/** 소속이 둘 이상일 때만 소속별 구분을 보여 준다 (센터 하나뿐이면 구분이 무의미) */
export function hasMultipleDepartments(members: { department: string }[]): boolean {
  return departmentsOf(members).length >= 2;
}
