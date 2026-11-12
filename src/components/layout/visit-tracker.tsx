"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** 공개 페이지를 열 때마다(메뉴 이동 포함) 방문 집계를 보낸다 — 관리자 > 방문자 통계 */
export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // 개발 모드의 effect 두 번 실행으로 중복 집계되지 않도록
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!navigator.sendBeacon?.("/api/visit")) {
      void fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
