/** 메인 화면 모달 팝업 도메인 타입 */
export const POPUP_POSITIONS = ["center", "custom"] as const;
export type PopupPosition = (typeof POPUP_POSITIONS)[number];

export interface Popup {
  id: number;
  title: string;
  /** 본문(텍스트, 줄바꿈 유지) */
  content: string;
  imageUrl: string | null;
  imageAlt: string | null;
  linkUrl: string | null;
  /** center: 화면 중앙 / custom: 좌상단 좌표(left, top) 지정 */
  position: PopupPosition;
  /** custom 위치일 때 좌측 기준 px */
  left: number;
  /** custom 위치일 때 상단 기준 px */
  top: number;
  width: number;
  /** null 이면 내용에 맞춰 자동 */
  height: number | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/** 공개 화면에 전달되는 팝업 데이터 (직렬화 가능한 최소 필드) */
export type PublicPopup = Pick<
  Popup,
  | "id"
  | "title"
  | "content"
  | "imageUrl"
  | "imageAlt"
  | "linkUrl"
  | "position"
  | "left"
  | "top"
  | "width"
  | "height"
  | "startsAt"
  | "endsAt"
>;
