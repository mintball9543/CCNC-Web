"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";

const options = [
  { value: "light", label: "라이트 모드", Icon: Sun },
  { value: "dark", label: "다크 모드", Icon: Moon },
  { value: "system", label: "시스템 설정", Icon: Monitor },
] as const;

const subscribe = () => () => {};

/** 라이트 → 다크 → 시스템 순환 토글 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // 하이드레이션 이전에는 서버/클라이언트 불일치를 피하기 위해 기본 아이콘을 렌더링
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const currentIndex = Math.max(
    0,
    options.findIndex((o) => o.value === theme),
  );
  const current = mounted ? options[currentIndex] : options[2];
  const next = options[(currentIndex + 1) % options.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label={`화면 테마: ${current.label} (눌러서 ${next.label}로 변경)`}
      title={current.label}
    >
      <current.Icon className="size-5" aria-hidden />
    </button>
  );
}
