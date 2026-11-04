"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { moveRect, resizeRect, type Rect, type Viewport } from "@/lib/popup/layout";

export type DragMode = "move" | "resize";

interface Options {
  /** 현재 사각형 (높이 자동인 경우 실제 측정값을 돌려주는 함수 사용) */
  rect: Rect | (() => Rect);
  /** 이동/크기 조절이 일어날 수 있는 영역 (실제 px 기준) */
  bounds: Viewport;
  onChange: (rect: Rect, mode: DragMode) => void;
  onEnd?: (rect: Rect, mode: DragMode) => void;
  /** 화면에 축소 표시 중일 때의 배율 (관리자 미리보기) */
  scale?: number;
  disabled?: boolean;
  minSize?: { width: number; height: number };
}

/**
 * 마우스·터치(Pointer Events)로 사각형을 끌어 이동하거나 우하단 핸들로 크기를 조절한다.
 * 공개 화면 팝업과 관리자 팝업 미리보기에서 공통 사용.
 */
export function useDragResize({
  rect,
  bounds,
  onChange,
  onEnd,
  scale = 1,
  disabled,
  minSize,
}: Options) {
  const session = useRef<{
    mode: "move" | "resize";
    x: number;
    y: number;
    start: Rect;
    last: Rect;
  } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const mode = event.currentTarget.dataset.dragMode as DragMode | undefined;
    if (!mode || disabled || event.button !== 0) return;
    // 버튼·링크 클릭은 드래그로 처리하지 않음
    if (mode === "move" && (event.target as HTMLElement).closest("button, a, input, textarea"))
      return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = typeof rect === "function" ? rect() : rect;
    session.current = { mode, x: event.clientX, y: event.clientY, start, last: start };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s) return;
    const dx = (event.clientX - s.x) / scale;
    const dy = (event.clientY - s.y) / scale;
    s.last =
      s.mode === "move"
        ? moveRect(s.start, dx, dy, bounds)
        : resizeRect(s.start, dx, dy, bounds, minSize);
    onChange(s.last, s.mode);
  };

  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s) return;
    session.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onEnd?.(s.last, s.mode);
  };

  const common = {
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
    style: { touchAction: "none" as const },
  };
  return {
    dragHandleProps: { ...common, "data-drag-mode": "move" },
    resizeHandleProps: { ...common, "data-drag-mode": "resize" },
  };
}
