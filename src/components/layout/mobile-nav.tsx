"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import type { NavSection } from "@/types";

export function MobileNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  // 페이지 이동 시 닫기
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
        aria-label="전체 메뉴 열기"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Menu className="size-6" />
      </button>

      {/* 헤더의 backdrop-filter 가 fixed 요소의 기준이 되므로 body 로 포털 렌더링 */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="전체 메뉴"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <nav
              id="mobile-menu"
              className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col bg-background shadow-xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-semibold">전체 메뉴</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
                  aria-label="메뉴 닫기"
                >
                  <X className="size-6" />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto p-2">
                {sections.map((section) => {
                  const isOpen = expanded === section.key;
                  return (
                    <li key={section.key} className="border-b border-border last:border-0">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : section.key)}
                        className="flex w-full items-center justify-between px-3 py-4 text-left font-semibold"
                        aria-expanded={isOpen}
                      >
                        {section.title}
                        <ChevronDown className={cn("size-4 transition", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <ul className="pb-3">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  "block rounded-lg px-5 py-2 text-sm",
                                  pathname.startsWith(item.href)
                                    ? "bg-primary-soft font-medium text-primary"
                                    : "text-muted-foreground hover:bg-muted",
                                )}
                              >
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
