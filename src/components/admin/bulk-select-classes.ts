/**
 * 선택 삭제 표의 공용 클래스.
 * 서버 컴포넌트(PostTable·InquiryTable)에서 쓰므로 "use client" 파일이 아닌 곳에 둔다
 * (클라이언트 모듈에서 내보낸 문자열은 서버에서 문자열이 아닌 참조로 바뀐다).
 */

/** 체크박스 칸 — 번호 칸처럼 내용 폭에 맞춘 좁은 칸 */
export const SELECT_CELL_CLASS = "w-11 px-0 text-center";

/** 체크된 행을 연한 초록으로 칠한다 (행 <tr> 에 붙이는 클래스) */
export const SELECTABLE_ROW_CLASS =
  "transition-colors has-checked:bg-primary/10 dark:has-checked:bg-primary/20";
