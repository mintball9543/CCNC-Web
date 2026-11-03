"use client";

import { useState } from "react";
import { computePopupBox, type Viewport } from "@/lib/popup/layout";
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

/** 실제 화면 대비 축소 미리보기 — 공개 화면과 동일한 computePopupBox 사용 */
export function PopupPreview({ draft }: { draft: PopupDraft }) {
  const [device, setDevice] = useState<keyof typeof devices>("desktop");
  const viewport = devices[device];
  const frameWidth = device === "desktop" ? 480 : 220;
  const scale = frameWidth / viewport.width;

  const toNum = (s: string, fallback: number) =>
    Number.isFinite(Number(s)) && s !== "" ? Number(s) : fallback;
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
        className="relative mx-auto overflow-hidden rounded-md border border-border bg-muted"
        style={{ width: frameWidth, height: viewport.height * scale }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/30" />
        <div
          className="absolute flex flex-col overflow-hidden rounded bg-card shadow-lg ring-1 ring-border"
          style={{
            left: box.left * scale,
            top: box.top * scale,
            width: box.width * scale,
            height: box.height ? box.height * scale : undefined,
            maxHeight: box.maxHeight * scale,
          }}
        >
          <div
            className="min-h-0 flex-1 overflow-hidden p-1.5"
            style={{ fontSize: Math.max(6, 14 * scale * 2) }}
          >
            <p className="truncate font-bold">{draft.title || "제목"}</p>
            {draft.imageUrl && <div className="my-1 aspect-video w-full bg-ci-green-3/40" />}
            <p className="line-clamp-6 whitespace-pre-line opacity-80">{draft.content}</p>
          </div>
          <div className="h-2 shrink-0 bg-muted" />
        </div>
      </div>
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
