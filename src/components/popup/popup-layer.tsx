"use client";

import Link from "next/link";
import { GripHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDragResize } from "@/hooks/use-drag-resize";
import {
  computePopupBox,
  isPopupInSchedule,
  moveRect,
  type Rect,
  type Viewport,
} from "@/lib/popup/layout";
import type { PublicPopup } from "@/types";

const HIDE_KEY = (id: number) => `ccnc:popup-hidden:${id}`;

/** '오늘 하루 보지 않기' — 자정(로컬 시간)까지 숨김 */
function isHiddenToday(id: number) {
  try {
    const until = Number(window.localStorage.getItem(HIDE_KEY(id)));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function hideUntilTomorrow(id: number) {
  try {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    window.localStorage.setItem(HIDE_KEY(id), String(midnight.getTime()));
  } catch {
    /* 저장소 차단 시 무시 */
  }
}

function subscribeViewport(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}
let cachedViewport: Viewport | null = null;
function getViewport(): Viewport {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!cachedViewport || cachedViewport.width !== w || cachedViewport.height !== h) {
    cachedViewport = { width: w, height: h };
  }
  return cachedViewport;
}

/**
 * 메인 화면 모달 팝업 레이어.
 * - 관리자에서 설정한 위치(중앙/좌상단 좌표)와 크기를 초기값으로 사용
 * - 사용자는 상단 막대를 끌어 이동하고, 우하단 모서리를 끌어 크기를 조절할 수 있다
 * - 게시 기간·'오늘 하루 보지 않기'는 브라우저 현재 시각 기준으로 판단
 * - Esc 로 가장 위의 팝업 닫기, 클릭한 팝업을 맨 앞으로
 */
export function PopupLayer({ popups }: { popups: PublicPopup[] }) {
  const [visibleIds, setVisibleIds] = useState<number[] | null>(null);
  /** 앞에 표시되는 순서 (마지막이 가장 위) */
  const [order, setOrder] = useState<number[]>([]);
  const viewport = useSyncExternalStore(subscribeViewport, getViewport, () => null);

  useEffect(() => {
    const ids = popups.filter((p) => isPopupInSchedule(p) && !isHiddenToday(p.id)).map((p) => p.id);
    // 마운트 후 브라우저 시각/저장소 기준으로 노출 대상 결정
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleIds(ids);
    setOrder(ids);
  }, [popups]);

  const close = useCallback((id: number, hideToday = false) => {
    if (hideToday) hideUntilTomorrow(id);
    setVisibleIds((ids) => ids?.filter((v) => v !== id) ?? null);
    setOrder((o) => o.filter((v) => v !== id));
  }, []);

  const bringToFront = useCallback((id: number) => {
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((v) => v !== id), id]));
  }, []);

  const topId = order[order.length - 1];
  useEffect(() => {
    if (topId === undefined) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(topId);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [topId, close]);

  const visible = popups.filter((p) => visibleIds?.includes(p.id));
  if (!viewport || visible.length === 0) return null;

  let centerIndex = 0;
  return (
    <div className="fixed inset-0 z-[60]" aria-live="polite">
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      {visible.map((popup, index) => (
        <PopupWindow
          key={popup.id}
          popup={popup}
          viewport={viewport}
          initial={computePopupBox(
            popup,
            viewport,
            popup.position === "center" ? centerIndex++ : 0,
          )}
          zIndex={order.indexOf(popup.id) + 1}
          autoFocus={index === 0}
          onFocus={() => bringToFront(popup.id)}
          onClose={(hideToday) => close(popup.id, hideToday)}
        />
      ))}
    </div>
  );
}

function PopupWindow({
  popup,
  viewport,
  initial,
  zIndex,
  autoFocus,
  onFocus,
  onClose,
}: {
  popup: PublicPopup;
  viewport: Viewport;
  initial: ReturnType<typeof computePopupBox>;
  zIndex: number;
  autoFocus: boolean;
  onFocus: () => void;
  onClose: (hideToday: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /** 사용자가 이동/크기 조절한 뒤의 위치 (그 전에는 관리자 설정값 사용) */
  const [userRect, setUserRect] = useState<Rect | null>(null);
  const rect = userRect ? moveRect(userRect, 0, 0, viewport) : null;

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const measure = (): Rect => ({
    left: rect?.left ?? initial.left,
    top: rect?.top ?? initial.top,
    width: rect?.width ?? initial.width,
    height: rect?.height ?? ref.current?.offsetHeight ?? initial.height ?? 300,
  });

  const { dragHandleProps, resizeHandleProps } = useDragResize({
    rect: measure,
    bounds: viewport,
    onChange: setUserRect,
  });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`popup-title-${popup.id}`}
      tabIndex={-1}
      onPointerDownCapture={onFocus}
      className="absolute flex flex-col overflow-hidden rounded-xl bg-card text-foreground shadow-2xl ring-1 ring-border focus:outline-none"
      style={{
        left: rect?.left ?? initial.left,
        top: rect?.top ?? initial.top,
        width: rect?.width ?? initial.width,
        height: rect?.height ?? initial.height ?? undefined,
        maxHeight: rect ? undefined : initial.maxHeight,
        zIndex,
      }}
    >
      <div
        {...dragHandleProps}
        className="flex shrink-0 cursor-move items-center gap-2 border-b border-border bg-muted/70 py-2 pr-2 pl-4 select-none"
        title="끌어서 이동"
      >
        <GripHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <h2
          id={`popup-title-${popup.id}`}
          className="min-w-0 flex-1 truncate text-sm font-semibold"
        >
          {popup.title}
        </h2>
        <button
          type="button"
          onClick={() => onClose(false)}
          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-background"
          aria-label={`${popup.title} 팝업 닫기`}
        >
          <X className="size-4" />
        </button>
      </div>
      <PopupBody popup={popup} />
      <div className="relative flex shrink-0 items-center justify-between border-t border-border bg-muted px-3 py-2 text-sm">
        <button type="button" className="hover:underline" onClick={() => onClose(true)}>
          오늘 하루 보지 않기
        </button>
        <button
          type="button"
          className="mr-4 font-medium hover:underline"
          onClick={() => onClose(false)}
        >
          닫기
        </button>
        <span
          {...resizeHandleProps}
          className="absolute right-0 bottom-0 size-4 cursor-se-resize"
          title="끌어서 크기 조절"
          aria-hidden
        >
          <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground">
            <path d="M15 6 6 15M15 10l-5 5M15 14l-1 1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function PopupBody({ popup }: { popup: PublicPopup }) {
  const inner = (
    <>
      {popup.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={popup.imageUrl}
          alt={popup.imageAlt ?? ""}
          className="h-auto w-full"
          draggable={false}
        />
      )}
      {popup.content && (
        <p className="px-5 py-4 text-sm leading-relaxed whitespace-pre-line">{popup.content}</p>
      )}
    </>
  );
  const scroll = "block min-h-0 flex-1 overflow-y-auto";
  if (!popup.linkUrl) return <div className={scroll}>{inner}</div>;

  const external = /^https?:\/\//.test(popup.linkUrl);
  return external ? (
    <a
      href={popup.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={scroll}
      draggable={false}
    >
      {inner}
      <span className="sr-only"> (새 창)</span>
    </a>
  ) : (
    <Link href={popup.linkUrl} className={scroll} draggable={false}>
      {inner}
    </Link>
  );
}
