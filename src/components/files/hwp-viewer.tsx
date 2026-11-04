"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HWP(한글 5.0) 문서 브라우저 미리보기 — hwp.js(Apache-2.0) 사용.
 * 복잡한 서식은 원본과 다르게 보일 수 있으며, HWPX 는 지원하지 않는다. (ISSUES.md FEAT-016)
 */
export function HwpViewer({ src, downloadUrl }: { src: string; downloadUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let disposed = false;
    let viewer: { distory(): void } | null = null;

    (async () => {
      try {
        const [{ Viewer }, response] = await Promise.all([import("hwp.js"), fetch(src)]);
        if (!response.ok) throw new Error(String(response.status));
        const data = new Uint8Array(await response.arrayBuffer());
        if (disposed || !containerRef.current) return;
        viewer = new Viewer(containerRef.current, data, { type: "array" });
        setStatus("ready");
      } catch (error) {
        console.error("HWP 미리보기 실패", error);
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      try {
        viewer?.distory();
      } catch {
        /* noop */
      }
    };
  }, [src]);

  return (
    <div className="flex flex-1 flex-col">
      {status === "loading" && (
        <p className="p-8 text-center text-muted-foreground">문서를 불러오는 중…</p>
      )}
      {status === "error" && (
        <p className="p-8 text-center text-muted-foreground">
          이 문서는 미리보기를 표시할 수 없습니다.{" "}
          <a href={downloadUrl} className="text-primary underline">
            다운로드
          </a>
          하여 확인해 주세요.
        </p>
      )}
      <div ref={containerRef} className="hwp-viewer flex-1 overflow-auto bg-white text-black" />
    </div>
  );
}
