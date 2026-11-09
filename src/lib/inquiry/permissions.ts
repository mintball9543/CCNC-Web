/**
 * 작성자 본인의 문의 수정·삭제 권한 판단 (순수 함수).
 *
 * - 관리자 답변이 등록되면 수정·삭제할 수 없다.
 * - 비공개 문의: 작성 시 입력한 비밀번호로만 확인한다.
 *   (같은 브라우저라도 비밀번호 없이 열리면 공용 PC 에서 내용이 노출될 수 있으므로)
 * - 공개 문의: 작성한 브라우저(쿠키)이면 바로 가능, 비밀번호가 있는 글은 비밀번호로도 가능.
 */
export interface InquiryAuthFacts {
  isPrivate: boolean;
  hasPassword: boolean;
  answered: boolean;
}

export interface InquiryAuthContext {
  /** 이 브라우저가 작성한 글인지 */
  isOwnerBrowser: boolean;
  /** 입력한 비밀번호가 맞는지 (입력하지 않았으면 false) */
  passwordOk: boolean;
}

export type InquiryAuthResult =
  { ok: true } | { ok: false; reason: "answered" | "password-required" | "owner-only" };

export function canAuthorModify(
  facts: InquiryAuthFacts,
  ctx: InquiryAuthContext,
): InquiryAuthResult {
  if (facts.answered) return { ok: false, reason: "answered" };
  if (ctx.passwordOk) return { ok: true };
  if (!facts.isPrivate && ctx.isOwnerBrowser) return { ok: true };
  if (facts.isPrivate || facts.hasPassword) return { ok: false, reason: "password-required" };
  return { ok: false, reason: "owner-only" };
}

export const AUTH_MESSAGES: Record<Exclude<InquiryAuthResult, { ok: true }>["reason"], string> = {
  answered: "답변이 등록된 문의는 수정하거나 삭제할 수 없습니다.",
  "password-required": "작성 시 입력한 비밀번호를 확인해 주세요.",
  "owner-only": "공개 문의는 작성한 브라우저(기기)에서만 수정·삭제할 수 있습니다.",
};

/** 화면에서 수정·삭제 버튼을 보여 줄지 (비밀번호 입력 전 단계) */
export function authorActionMode(
  facts: InquiryAuthFacts,
  isOwnerBrowser: boolean,
): "direct" | "password" | "none" {
  if (facts.answered) return "none";
  if (!facts.isPrivate && isOwnerBrowser) return "direct";
  if (facts.isPrivate || facts.hasPassword) return "password";
  return "none";
}
