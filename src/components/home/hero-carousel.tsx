"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import type { HeroSlide } from "@/types";

const INTERVAL_MS = 6000;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * 메인 비주얼 — 관리자가 올린 행사·활동 사진 슬라이드.
 * 자동 넘김은 정지 버튼으로 멈출 수 있고, '동작 줄이기' 설정 시 자동 넘김을 하지 않는다.
 */
export function HeroCarousel({
  slides,
  fallbackTitle,
  fallbackSubtitle,
}: {
  slides: HeroSlide[];
  fallbackTitle: string;
  fallbackSubtitle: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const count = slides.length;
  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, count]);

  const slide = slides[index];

  return (
    <section
      className="relative isolate overflow-hidden bg-ci-navy text-white"
      aria-roledescription="carousel"
      aria-label="센터 활동 사진"
    >
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.id}
          src={s.imageUrl}
          alt={i === index ? s.imageAlt : ""}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 -z-20 size-full object-cover transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[420px] w-full max-w-7xl flex-col justify-end px-4 py-14 sm:px-6 lg:min-h-[520px] lg:px-8 lg:py-20">
        <div aria-live={paused ? "polite" : "off"} className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wider text-ci-lime">
            CHUNGNAM CARBON NEUTRALITY CENTER
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {slide.title || fallbackTitle}
          </h1>
          <p className="mt-4 text-base text-white/85 lg:text-lg">
            {slide.subtitle || fallbackSubtitle}
          </p>
          {slide.linkUrl && (
            <Link
              href={slide.linkUrl}
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-white px-5 text-sm font-semibold text-ci-navy hover:bg-white/90"
            >
              자세히 보기
            </Link>
          )}
        </div>

        {count > 1 && (
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="rounded-full bg-white/15 p-2 hover:bg-white/25"
              aria-label="이전 사진"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-sm tabular-nums">
              <strong>{index + 1}</strong> / {count}
            </span>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="rounded-full bg-white/15 p-2 hover:bg-white/25"
              aria-label="다음 사진"
            >
              <ChevronRight className="size-5" />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="rounded-full bg-white/15 p-2 hover:bg-white/25"
                aria-label={paused ? "자동 넘김 시작" : "자동 넘김 정지"}
              >
                {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
              </button>
            )}
            <div className="ml-2 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${i + 1}번째 사진`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-white" : "w-3 bg-white/40",
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
