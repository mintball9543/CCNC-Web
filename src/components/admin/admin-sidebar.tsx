"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, MessageCircleQuestion, PanelTop } from "lucide-react";
import { boardList } from "@/lib/config/boards";
import { cn } from "@/lib/utils/cn";

const groups = [
  {
    title: null,
    items: [{ href: "/admin", label: "대시보드", Icon: LayoutDashboard, exact: true }],
  },
  {
    title: "메인 화면",
    items: [{ href: "/admin/popups", label: "팝업 관리", Icon: PanelTop }],
  },
  {
    title: "게시판",
    items: boardList.map((b) => ({
      href: `/admin/boards/${b.key}`,
      label: b.title,
      Icon: FileText,
    })),
  },
  {
    title: "소통",
    items: [{ href: "/admin/inquiries", label: "문의 관리", Icon: MessageCircleQuestion }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="관리자 메뉴" className="space-y-6">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">{group.title}</p>
          )}
          <ul className="space-y-1">
            {group.items.map(({ href, label, Icon, ...rest }) => {
              const active =
                "exact" in rest
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-primary-soft font-semibold text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
