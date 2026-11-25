"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * 관리자 사이드바 틀.
 * - 데스크톱(lg 이상): 화면 높이에 고정되고 메뉴 영역만 따로 스크롤된다. 본문은 창 스크롤을 그대로 쓴다.
 * - 모바일: 메뉴가 본문을 밀어내지 않도록 접어 두고, 버튼으로 펼친다. 메뉴 링크를 누르면 다시 접힌다.
 */
export function AdminSidebarShell({
  brand,
  children,
}: {
  brand: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between p-4 lg:block lg:shrink-0 lg:p-5">
        {brand}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted lg:hidden"
        >
          {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          메뉴
        </button>
      </div>
      <div
        id="admin-menu"
        // 메뉴 링크를 누르면 접는다 (usePathname 은 프리렌더 시 Suspense 가 필요해 쓰지 않음)
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={cn(
          "max-h-[70vh] overflow-y-auto overscroll-contain px-3 pb-4",
          "lg:block lg:max-h-none lg:min-h-0 lg:flex-1",
          open ? "block" : "hidden",
        )}
      >
        {children}
      </div>
    </aside>
  );
}
