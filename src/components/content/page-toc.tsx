"use client";

import { List, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";

export interface TocItem {
  id: string;
  title: string;
}

/** 현재 읽고 있는 구역: 제목이 화면 위쪽 35% 선을 지난 마지막 구역 */
function currentSection(items: readonly TocItem[]) {
  const line = window.innerHeight * 0.35;
  let active = items[0]?.id ?? null;
  for (const item of items) {
    const el = document.getElementById(item.id);
    if (el && el.getBoundingClientRect().top <= line) active = item.id;
  }
  // 맨 아래까지 내리면 마지막 구역
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
    active = items[items.length - 1]?.id ?? active;
  return active;
}

/**
 * 긴 페이지의 목차.
 * - 본문 위에 가로형 목차를 보여 주고, 스크롤로 가려지면 따라다니는 세로형 목차를 띄운다.
 *   - 데스크톱(lg 이상): 왼쪽 메뉴 자리에 세로형 목차 (현재 구역 강조)
 *   - 모바일·태블릿: 본문을 가리지 않도록 왼쪽 아래 '목차' 버튼 → 눌렀을 때만 목록 표시
 */
export function PageToc({
  items,
  inlineGridClassName = "sm:grid-cols-4",
}: {
  items: readonly TocItem[];
  /** 본문 위 가로형 목차의 열 구성 (항목 수에 맞춰 조정) */
  inlineGridClassName?: string;
}) {
  const inlineRef = useRef<HTMLElement>(null);
  const [inlineHidden, setInlineHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  // 떠 있는 목차가 사라지면 펼친 목록도 닫힌 것으로 본다
  const listOpen = open && inlineHidden;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = inlineRef.current;
      setInlineHidden(nav ? nav.getBoundingClientRect().bottom < 96 : false);
      setActive(currentSection(items));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    if (!listOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listOpen]);

  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
  const goTo = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    el.scrollIntoView({ behavior, block: "start" });
    history.replaceState(null, "", `#${id}`);
    // 키보드·스크린리더 사용자를 위해 제목으로 초점 이동
    const heading = el.querySelector<HTMLElement>("h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };

  const numbered = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <>
      {/* 본문 위 가로형 목차 */}
      <nav ref={inlineRef} aria-label="이 페이지의 내용" className="rounded-2xl bg-muted/60 p-5">
        <ol className={cn("grid gap-2", inlineGridClassName)}>
          {items.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={goTo(s.id)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium hover:text-primary"
              >
                <span className="font-mono text-sm text-primary">{numbered(i)}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 데스크톱: 왼쪽 메뉴 자리에 따라다니는 세로형 목차 */}
      <nav
        aria-label="이 페이지의 내용 (따라다니는 목차)"
        aria-hidden={!inlineHidden}
        inert={!inlineHidden}
        className={cn(
          "fixed top-32 z-30 hidden w-56 transition duration-200 lg:block print:hidden",
          "left-[max(2rem,calc((100vw-80rem)/2+2rem))]",
          inlineHidden ? "opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <p className="mb-2 px-3 text-sm font-semibold text-muted-foreground">이 페이지의 내용</p>
        <ol className="space-y-1 border-l-2 border-border">
          {items.map((s, i) => {
            const current = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={goTo(s.id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "-ml-0.5 flex items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors",
                    current
                      ? "border-primary bg-primary-soft font-bold text-primary"
                      : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-xs">{numbered(i)}</span>
                  {s.title}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* 모바일·태블릿: 왼쪽 아래 '목차' 버튼 */}
      <div
        className={cn(
          "fixed bottom-4 left-4 z-40 transition duration-200 sm:bottom-6 sm:left-6 lg:hidden print:hidden",
          inlineHidden ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
        inert={!inlineHidden}
      >
        {listOpen && (
          <nav
            id="floating-toc"
            aria-label="이 페이지의 내용"
            className="mb-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-lg"
          >
            <ol>
              {items.map((s, i) => {
                const current = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={goTo(s.id)}
                      aria-current={current ? "location" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                        current ? "bg-primary-soft font-bold text-primary" : "hover:bg-muted",
                      )}
                    >
                      <span className="font-mono text-xs">{numbered(i)}</span>
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <button
          type="button"
          onClick={() => setOpen(!listOpen)}
          aria-expanded={listOpen}
          aria-controls="floating-toc"
          className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold shadow-lg"
        >
          {listOpen ? (
            <X className="size-4" aria-hidden />
          ) : (
            <List className="size-4" aria-hidden />
          )}
          목차
          {!listOpen && active && (
            <span className="font-mono text-xs text-primary">
              {numbered(items.findIndex((s) => s.id === active))}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
