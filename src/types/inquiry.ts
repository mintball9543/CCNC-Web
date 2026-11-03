/** 문의 게시판 도메인 타입 */
export type InquiryStatus = "pending" | "answered";

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  authorName: string;
  email: string;
  phone: string | null;
  isPrivate: boolean;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 공개 목록용 요약 (개인정보·본문 제외) */
export interface InquirySummary {
  id: number;
  title: string;
  maskedAuthor: string;
  isPrivate: boolean;
  status: InquiryStatus;
  createdAt: Date;
}

/** 공개 상세 — 비공개 글은 본문/답변이 비어 있다 */
export interface PublicInquiryDetail extends InquirySummary {
  content: string | null;
  answer: string | null;
  answeredAt: Date | null;
}
