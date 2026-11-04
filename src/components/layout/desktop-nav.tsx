"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { NavSection } from "@/types";

/**
 * 데스크톱 GNB 드롭다운.
 * 열림 상태를 명시적으로 관리한다 — 마우스가 메뉴 밖으로 나가거나, 하위 메뉴를 클릭해 이동하거나,
 * 포커스가 메뉴를 벗어나거나, Esc 를 누르면 닫힌다. (CSS focus-within 으로 인해 클릭 후 열려 있던 문제 수정)
 */
export function DesktopNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // 페이지 이동 시 닫기
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const openNow = (key: string) => {
    window.clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    // 메뉴 사이를 지나갈 때 깜빡이지 않도록 짧은 지연
    closeTimer.current = window.setTimeout(() => setOpen(null), 120);
  };
  const closeAndBlur = () => {
    setOpen(null);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <nav
      ref={navRef}
      aria-label="주 메뉴"
      className="hidden h-full lg:block"
      onMouseLeave={closeSoon}
      onBlur={(e) => {
        if (!navRef.current?.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <ul className="flex h-full items-center gap-1">
        {sections.map((section) => {
          const isOpen = open === section.key;
          const isCurrent = pathname.split("/")[1] === section.key;
          return (
            <li
              key={section.key}
              className="relative flex h-full items-center"
              onMouseEnter={() => openNow(section.key)}
              onFocus={() => openNow(section.key)}
            >
              <Link
                href={section.href}
                onClick={closeAndBlur}
                aria-expanded={isOpen}
                className={cn(
                  "rounded-lg px-4 py-2 text-[16px] font-bold transition hover:text-primary",
                  isCurrent && "text-primary",
                )}
              >
                {section.title}
              </Link>
              <div
                className={cn(
                  "absolute top-full left-1/2 w-52 -translate-x-1/2 pt-2 transition",
                  isOpen ? "visible opacity-100" : "invisible opacity-0",
                )}
              >
                <ul className="rounded-xl border border-border bg-card p-2 shadow-lg">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeAndBlur}
                        tabIndex={isOpen ? 0 : -1}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition hover:bg-muted hover:text-foreground",
                          pathname.startsWith(item.href)
                            ? "font-semibold text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
