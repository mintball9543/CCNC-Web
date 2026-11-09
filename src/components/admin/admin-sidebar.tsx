"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  FileText,
  Globe,
  History,
  Hash,
  Images,
  LayoutDashboard,
  ListTree,
  MessageCircleQuestion,
  PanelTop,
  Settings,
  Users,
} from "lucide-react";
import { boardList } from "@/lib/config/boards";
import { cn } from "@/lib/utils/cn";

const groups = [
  {
    title: null,
    items: [{ href: "/admin", label: "대시보드", Icon: LayoutDashboard, exact: true }],
  },
  {
    title: "메인 화면",
    items: [
      { href: "/admin/hero", label: "메인 비주얼(사진)", Icon: Images },
      { href: "/admin/popups", label: "팝업 관리", Icon: PanelTop },
      { href: "/admin/stats", label: "숫자로 보는 센터", Icon: Hash },
      { href: "/admin/charts", label: "도표 관리", Icon: BarChart3 },
    ],
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
  {
    title: "사이트 설정",
    items: [
      { href: "/admin/menus", label: "메뉴 표시 설정", Icon: ListTree },
      { href: "/admin/organization", label: "조직도", Icon: Users },
      { href: "/admin/related-sites", label: "관련 사이트", Icon: Globe },
      { href: "/admin/settings", label: "기관 정보·비밀번호", Icon: Building2 },
    ],
  },
  {
    title: "보안",
    items: [{ href: "/admin/logs", label: "작업 기록(접속 IP)", Icon: History }],
  },
] as const;

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
            {group.items.map((item) => {
              const { href, label, Icon } = item;
              const exact = "exact" in item && item.exact;
              const active = exact
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
      <p className="px-3 text-xs text-muted-foreground">
        <Settings className="mr-1 inline size-3" aria-hidden />
        변경 사항은 저장 즉시 홈페이지에 반영됩니다.
      </p>
    </nav>
  );
}
