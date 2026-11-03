import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { NavSection } from "@/types";

/** 좌측 메뉴(LNB) 마크업 — 모바일에서는 가로 스크롤 탭 */
export function SectionSideNavView({
  section,
  activeHref,
}: {
  section: NavSection;
  activeHref: string | null;
}) {
  return (
    <nav aria-label={`${section.title} 하위 메뉴`}>
      <h2 className="mb-3 hidden text-xl font-bold lg:block">{section.title}</h2>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {section.items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-4 py-2.5 text-sm transition",
                  isActive
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground lg:border-0",
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
