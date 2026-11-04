"use client";

import { Move } from "lucide-react";
import { useRef, useState } from "react";
import { useDragResize, type DragMode } from "@/hooks/use-drag-resize";
import { computePopupBox, type Rect, type Viewport } from "@/lib/popup/layout";
import { cn } from "@/lib/utils/cn";
import type { PopupPosition } from "@/types";

export interface PopupDraft {
  title: string;
  content: string;
  imageUrl: string;
  position: PopupPosition;
  left: string;
  top: string;
  width: string;
  height: string;
}

const devices: Record<"desktop" | "mobile", Viewport & { label: string }> = {
  desktop: { width: 1440, height: 900, label: "PC 1440×900" },
  mobile: { width: 375, height: 740, label: "모바일 375×740" },
};

/**
 * 실제 화면 대비 축소 미리보기 — 공개 화면과 동일한 computePopupBox 사용.
 * PC 미리보기에서는 팝업을 끌어 위치를, 우하단 모서리를 끌어 크기를 지정할 수 있다.
 * (끌어서 이동하면 '좌표 지정' 방식으로 전환된다)
 */
export function PopupPreview({
  draft,
  onGeometryChange,
}: {
  draft: PopupDraft;
  onGeometryChange: (rect: Rect, mode: DragMode) => void;
}) {
  const [device, setDevice] = useState<keyof typeof devices>("desktop");
  const boxRef = useRef<HTMLDivElement>(null);
  const viewport = devices[device];
  const frameWidth = device === "desktop" ? 480 : 220;
  const scale = frameWidth / viewport.width;
  const interactive = device === "desktop";

  const toNum = (s: string, fallback: number) =>
    s !== "" && Number.isFinite(Number(s)) ? Number(s) : fallback;
  const box = computePopupBox(
    {
      position: draft.position,
      left: toNum(draft.left, 0),
      top: toNum(draft.top, 0),
      width: Math.max(toNum(draft.width, 400), 1),
      height: draft.height ? toNum(draft.height, 0) : null,
    },
    viewport,
  );

  const measure = (): Rect => ({
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height ?? Math.round((boxRef.current?.offsetHeight ?? 300 * scale) / scale),
  });

  const { dragHandleProps, resizeHandleProps } = useDragResize({
    rect: measure,
    bounds: viewport,
    scale,
    disabled: !interactive,
    onChange: onGeometryChange,
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">미리보기</p>
        <div className="flex gap-1">
          {(Object.keys(devices) as (keyof typeof devices)[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-pressed={device === key}
              className={cn(
                "rounded-md px-2 py-1 text-xs",
                device === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {devices[key].label}
            </button>
          ))}
        </div>
      </div>
      <div
        className="relative mx-auto overflow-hidden rounded-md border border-border bg-muted select-none"
        style={{ width: frameWidth, height: viewport.height * scale }}
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div
          ref={boxRef}
          {...dragHandleProps}
          className={cn(
            "absolute flex flex-col overflow-hidden rounded bg-card shadow-lg ring-1 ring-border",
            interactive && "cursor-move ring-2 ring-primary/60",
          )}
          style={{
            ...dragHandleProps.style,
            left: box.left * scale,
            top: box.top * scale,
            width: box.width * scale,
            height: box.height ? box.height * scale : undefined,
            maxHeight: box.maxHeight * scale,
          }}
          role={interactive ? "application" : undefined}
          aria-label={
            interactive ? "팝업 미리보기 — 끌어서 이동, 우하단 모서리로 크기 조절" : undefined
          }
        >
          <div className="h-2.5 shrink-0 bg-muted" />
          <div
            className="min-h-0 flex-1 overflow-hidden p-1.5"
            style={{ fontSize: Math.max(6, 14 * scale * 2) }}
          >
            <p className="truncate font-bold">{draft.title || "제목"}</p>
            {draft.imageUrl && <div className="my-1 aspect-video w-full bg-ci-green-3/40" />}
            <p className="line-clamp-6 whitespace-pre-line opacity-80">{draft.content}</p>
          </div>
          <div className="relative h-2.5 shrink-0 bg-muted">
            {interactive && (
              <span
                {...resizeHandleProps}
                className="absolute right-0 bottom-0 size-3 cursor-se-resize rounded-tl bg-primary"
                title="끌어서 크기 조절"
              />
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Move className="size-3.5" aria-hidden />
        {interactive
          ? "팝업을 끌어 위치를, 우하단 초록 모서리를 끌어 크기를 바꿀 수 있습니다."
          : "모바일에서는 항상 화면 중앙에 표시됩니다. (편집은 PC 미리보기에서)"}
      </p>
      <dl className="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
        {[
          ["X", box.left],
          ["Y", box.top],
          ["W", box.width],
          ["H", box.height ?? "auto"],
        ].map(([k, val]) => (
          <div key={k} className="rounded bg-muted py-1">
            <dt className="inline font-medium">{k}</dt> <dd className="inline">{val}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
