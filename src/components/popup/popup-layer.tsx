"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { computePopupBox, isPopupInSchedule, type Viewport } from "@/lib/popup/layout";
import { cn } from "@/lib/utils/cn";
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
 * - 관리자에서 설정한 위치(중앙/좌상단 좌표)와 크기를 반영
 * - 게시 기간·'오늘 하루 보지 않기'는 브라우저 현재 시각 기준으로 판단
 * - Esc 로 가장 위의 팝업 닫기, 열릴 때 첫 팝업으로 포커스 이동
 */
export function PopupLayer({ popups }: { popups: PublicPopup[] }) {
  const [visibleIds, setVisibleIds] = useState<number[] | null>(null);
  const viewport = useSyncExternalStore(subscribeViewport, getViewport, () => null);
  const firstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 마운트 후 브라우저 시각/저장소 기준으로 노출 대상 결정
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleIds(
      popups.filter((p) => isPopupInSchedule(p) && !isHiddenToday(p.id)).map((p) => p.id),
    );
  }, [popups]);

  const close = useCallback((id: number, hideToday = false) => {
    if (hideToday) hideUntilTomorrow(id);
    setVisibleIds((ids) => ids?.filter((v) => v !== id) ?? null);
  }, []);

  const visible = popups.filter((p) => visibleIds?.includes(p.id));

  useEffect(() => {
    if (visible.length === 0) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(visible[visible.length - 1].id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length, close]);

  if (!viewport || visible.length === 0) return null;

  let centerIndex = 0;
  return (
    <div className="fixed inset-0 z-[60]" aria-live="polite">
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      {visible.map((popup, index) => {
        const box = computePopupBox(
          popup,
          viewport,
          popup.position === "center" ? centerIndex++ : 0,
        );
        return (
          <div
            key={popup.id}
            ref={index === 0 ? firstRef : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`popup-title-${popup.id}`}
            tabIndex={-1}
            className="absolute flex flex-col overflow-hidden rounded-xl bg-card text-foreground shadow-2xl ring-1 ring-border focus:outline-none"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height ?? undefined,
              maxHeight: box.maxHeight,
              zIndex: index + 1,
            }}
          >
            <PopupBody popup={popup} />
            <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted px-3 py-2 text-sm">
              <button
                type="button"
                className="hover:underline"
                onClick={() => close(popup.id, true)}
              >
                오늘 하루 보지 않기
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium hover:underline"
                onClick={() => close(popup.id)}
              >
                닫기 <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PopupBody({ popup }: { popup: PublicPopup }) {
  const inner = (
    <>
      <h2
        id={`popup-title-${popup.id}`}
        className={cn(popup.imageUrl && !popup.content ? "sr-only" : "px-5 pt-5 text-lg font-bold")}
      >
        {popup.title}
      </h2>
      {popup.imageUrl && (
        <Image
          src={popup.imageUrl}
          alt={popup.imageAlt ?? ""}
          width={popup.width}
          height={popup.height ?? popup.width}
          className="h-auto w-full"
          unoptimized
        />
      )}
      {popup.content && (
        <p className="px-5 py-4 text-sm leading-relaxed whitespace-pre-line">{popup.content}</p>
      )}
    </>
  );

  if (!popup.linkUrl) return <div className="min-h-0 flex-1 overflow-y-auto">{inner}</div>;

  const external = /^https?:\/\//.test(popup.linkUrl);
  return external ? (
    <a
      href={popup.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block min-h-0 flex-1 overflow-y-auto"
    >
      {inner}
      <span className="sr-only"> (새 창)</span>
    </a>
  ) : (
    <Link href={popup.linkUrl} className="block min-h-0 flex-1 overflow-y-auto">
      {inner}
    </Link>
  );
}
