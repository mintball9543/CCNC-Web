/**
 * 개인정보처리방침 공통 값 — `/privacy` 페이지와 문의 작성 화면의 동의 문구가 같은 값을 쓴다.
 *
 * ⚠️ `null` 인 값은 센터가 아직 정하지 않은 항목이다. 페이지에 '확인 필요' 표시로 드러나며,
 *    사이트 공개 전에 모두 채워야 한다. (ISSUES.md CONTENT-011)
 */
export const privacyPolicy = {
  /** 시행일 (YYYY년 M월 D일) — 사이트 공개일 */
  effectiveDate: null as string | null,

  /** 문의 게시판 개인정보 보유 기간 (예: "답변 완료 후 3년") — TECH-008 자동 파기 기준 */
  inquiryRetention: null as string | null,

  /** 관리자 접속기록 보존 기간 — 코드의 AUDIT_RETENTION_DAYS(365일)와 같아야 한다 */
  auditLogRetention: "1년",

  /** 문의 작성자 확인 쿠키 유효 기간 — src/lib/inquiry/owner.ts 의 MAX_AGE_SECONDS */
  inquiryOwnerCookieAge: "2년",

  /** 관리자 로그인 쿠키 유효 기간 — src/lib/auth/token.ts 의 SESSION_MAX_AGE_SECONDS */
  adminSessionAge: "8시간",

  /** 개인정보 보호책임자 */
  officer: {
    name: null as string | null,
    position: null as string | null,
    phone: null as string | null,
    email: null as string | null,
  },

  /** 개인정보 보호 담당부서 (열람청구 접수·처리 부서) */
  department: {
    name: null as string | null,
    manager: null as string | null,
    phone: null as string | null,
    email: null as string | null,
  },

  /** 개인정보 처리 위탁 — 수탁자(업체명)가 정해지지 않은 업무는 null */
  processors: [
    { work: "홈페이지 서버 운영·유지보수", company: null as string | null },
    { work: "문의 답변 알림 전자우편 발송", company: null as string | null },
  ],
} as const;

/** 문의 작성 화면 동의 문구 — 처리방침과 같은 내용을 짧게 보여 준다 */
export const inquiryConsent = {
  items: "이름, 이메일, 연락처(선택), 비공개 문의 비밀번호(암호화 저장)",
  purpose: "문의 접수, 본인 확인, 답변 및 답변 알림 전자우편 발송",
  retention: privacyPolicy.inquiryRetention,
} as const;
