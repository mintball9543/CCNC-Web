/** 관리자 작업 기록 분류·동작 이름 (순수 데이터) */
export type AuditCategory = "view" | "auth" | "change";

export const AUDIT_CATEGORIES: { value: AuditCategory; label: string }[] = [
  { value: "view", label: "페이지 열람" },
  { value: "auth", label: "로그인·보안" },
  { value: "change", label: "등록·수정·삭제" },
];

export function categoryOf(action: string): AuditCategory {
  if (action.startsWith("view.")) return "view";
  if (action.startsWith("auth.")) return "auth";
  return "change";
}

export function categoryLabel(category: string): string {
  return AUDIT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
