"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 게시글 조회수 — 화면이 열릴 때 한 번 집계를 보내고 최신 값으로 바꿔 보여 준다.
 * 상세 화면은 캐시되므로 처음 값(initial)은 조금 오래된 값일 수 있다.
 */
export function PostViewCount({ postId, initial }: { postId: number; initial: number }) {
  const [views, setViews] = useState(initial);
  const sentFor = useRef<number | null>(null);

  useEffect(() => {
    // 개발 모드의 effect 두 번 실행으로 중복 요청되지 않도록 (요청은 취소하지 않고 한 번만 보낸다)
    if (sentFor.current === postId) return;
    sentFor.current = postId;
    fetch(`/api/posts/${postId}/view`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { views?: unknown } | null) => {
        if (sentFor.current === postId && typeof data?.views === "number") setViews(data.views);
      })
      .catch(() => {});
  }, [postId]);

  return <>{views.toLocaleString()}</>;
}
