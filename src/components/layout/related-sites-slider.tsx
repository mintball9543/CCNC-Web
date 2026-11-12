"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { canScroll, nextScrollLeft } from "@/lib/utils/carousel-scroll";
import type { RelatedSite } from "@/types";
import { RelatedSiteCard } from "./related-site-card";

const INTERVAL_MS = 3500;

/**
 * 관련 사이트 한 줄 슬라이더.
 * 한 줄에 다 들어가면 그대로 두고, 넘치면 한 칸씩 자동으로 넘어가며(끝에서 처음으로)
 * 이전·다음 버튼이나 손가락으로 밀어 넘겨볼 수 있다.
 * 마우스를 올리거나 키보드로 들어오면, 또는 직접 넘긴 직후에는 자동 넘김을 잠시 멈춘다.
 * 정지 버튼으로 끌 수 있고 '동작 줄이기' 설정 시에는 자동으로 넘기지 않는다.
 */
export function RelatedSitesSlider({ sites }: { sites: RelatedSite[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const lastTouchedAt = useRef(0);
  const [overflowing, setOverflowing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setOverflowing(canScroll(el));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sites.length]);

  const move = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      const first = el?.firstElementChild as HTMLElement | null;
      if (!el || !first) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const left = nextScrollLeft(
        {
          scrollLeft: el.scrollLeft,
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          step: first.offsetWidth + gap,
        },
        direction,
      );
      el.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion],
  );

  const autoplay = overflowing && !paused && !holding && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() - lastTouchedAt.current < INTERVAL_MS) return;
      move(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, move]);

  const touched = () => {
    lastTouchedAt.current = Date.now();
  };

  return (
    <section aria-labelledby="related-sites-heading">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="related-sites-heading" className="text-2xl font-bold">
          관련 사이트
        </h2>
        {overflowing && (
          <div className="flex items-center gap-1.5">
            <SliderButton
              label="이전 사이트"
              onClick={() => {
                touched();
                move(-1);
              }}
            >
              <ChevronLeft className="size-4" />
            </SliderButton>
            <SliderButton
              label="다음 사이트"
              onClick={() => {
                touched();
                move(1);
              }}
            >
              <ChevronRight className="size-4" />
            </SliderButton>
            {!reducedMotion && (
              <SliderButton
                label={paused ? "관련 사이트 자동 넘김 시작" : "관련 사이트 자동 넘김 정지"}
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </SliderButton>
            )}
          </div>
        )}
      </div>
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => setHolding(true)}
        onMouseLeave={() => setHolding(false)}
        onFocus={() => setHolding(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHolding(false);
        }}
        onPointerDown={touched}
        onTouchStart={touched}
        onWheel={touched}
      >
        {sites.map((site) => (
          <li
            key={site.id}
            className="shrink-0 basis-[calc((100%-0.75rem)/2)] snap-start sm:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-3rem)/5)]"
          >
            <RelatedSiteCard name={site.name} url={site.url} logoUrl={site.logoUrl} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SliderButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:border-primary hover:text-foreground"
    >
      {children}
    </button>
  );
}
