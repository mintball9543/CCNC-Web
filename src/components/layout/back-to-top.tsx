"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";

/** 이만큼(px) 내려가면 버튼을 보여 준다 */
const SHOW_AFTER = 600;

/**
 * 공개 사이트 전 페이지 공통 '맨 위로' 버튼 (오른쪽 아래).
 * 문의하기 버튼이 있으면 그 바로 위, 없으면 그 자리에 놓는다.
 * '동작 줄이기' 설정 사용자에게는 부드러운 스크롤 없이 바로 이동한다.
 */
export function BackToTop({ aboveFab }: { aboveFab: boolean }) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    // 키보드 사용자는 본문 처음(건너뛰기 링크 대상)으로 초점 이동
    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="맨 위로"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed z-40 flex size-12 flex-col items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition duration-200 hover:text-primary print:hidden",
        // 문의하기 버튼(64px, right-4 bottom-4 / sm:right-6 bottom-6)과 가운데 줄을 맞춘다
        aboveFab
          ? "right-6 bottom-24 sm:right-8 sm:bottom-28"
          : "right-4 bottom-4 sm:right-6 sm:bottom-6",
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-5" aria-hidden />
      <span className="text-[10px] leading-none font-semibold">TOP</span>
    </button>
  );
}
