import type { PublicPopup } from "@/types";

/** 모바일 등 좁은 화면에서 팝업 좌우 여백(px) */
export const POPUP_VIEWPORT_MARGIN = 16;
/** 이 너비 미만에서는 custom 좌표를 무시하고 중앙 정렬한다 */
export const POPUP_MOBILE_BREAKPOINT = 768;
/** 중앙 정렬 팝업이 여러 개일 때 겹치지 않도록 어긋나게 배치하는 간격(px) */
export const POPUP_CASCADE_OFFSET = 24;

export interface Viewport {
  width: number;
  height: number;
}

export interface PopupBox {
  left: number;
  top: number;
  width: number;
  /** null 이면 내용에 맞춰 자동 (최대 높이는 maxHeight) */
  height: number | null;
  maxHeight: number;
}

type PopupGeometry = Pick<PublicPopup, "position" | "left" | "top" | "width" | "height">;

/**
 * 팝업의 실제 화면 배치를 계산한다.
 * - 화면보다 큰 크기는 화면에 맞게 축소
 * - custom 좌표가 화면 밖으로 나가지 않도록 보정
 * - 모바일(768px 미만)에서는 항상 중앙 정렬
 */
export function computePopupBox(popup: PopupGeometry, viewport: Viewport, index = 0): PopupBox {
  const margin = POPUP_VIEWPORT_MARGIN;
  const maxWidth = Math.max(viewport.width - margin * 2, 0);
  const maxHeight = Math.max(viewport.height - margin * 2, 0);

  const width = Math.min(popup.width, maxWidth);
  const height = popup.height === null ? null : Math.min(popup.height, maxHeight);
  const boxHeightForCenter = height ?? Math.min(maxHeight, Math.round(viewport.height * 0.6));

  const isMobile = viewport.width < POPUP_MOBILE_BREAKPOINT;
  if (popup.position === "center" || isMobile) {
    const offset = isMobile ? 0 : index * POPUP_CASCADE_OFFSET;
    return {
      left: clamp(
        Math.round((viewport.width - width) / 2) + offset,
        margin,
        viewport.width - width - margin,
      ),
      top: clamp(
        Math.round((viewport.height - boxHeightForCenter) / 2) + offset,
        margin,
        viewport.height - boxHeightForCenter - margin,
      ),
      width,
      height,
      maxHeight,
    };
  }

  return {
    left: clamp(popup.left, 0, Math.max(viewport.width - width, 0)),
    top: clamp(popup.top, 0, Math.max(viewport.height - (height ?? 0), 0)),
    width,
    height,
    maxHeight: Math.max(viewport.height - clamp(popup.top, 0, viewport.height) - margin, 120),
  };
}

/** 게시 기간 내인지 확인 (기간 미지정 시 항상 노출) */
export function isPopupInSchedule(
  popup: Pick<PublicPopup, "startsAt" | "endsAt">,
  now: Date = new Date(),
): boolean {
  if (popup.startsAt && new Date(popup.startsAt) > now) return false;
  if (popup.endsAt && new Date(popup.endsAt) < now) return false;
  return true;
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
