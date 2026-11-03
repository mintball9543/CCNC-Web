"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { buildBreadcrumb, findNavItem } from "@/lib/config/navigation";

/**
 * 위치표시(브레드크럼) + 페이지 제목.
 * 두 값 모두 navigation 설정에서 파생되므로 메뉴명·제목·위치표시가 항상 일치한다.
 */
export function PageHeading() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumb(pathname);
  const title = findNavItem(pathname)?.title;

  return (
    <div className="mb-8 border-b border-border pb-6">
      <nav aria-label="현재 위치">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((crumb, i) => (
            <li key={crumb.title} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3" aria-hidden />}
              {crumb.href && i < crumbs.length - 1 ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {i === 0 ? <Home className="size-3.5" aria-label="홈" /> : crumb.title}
                </Link>
              ) : (
                <span aria-current="page">{crumb.title}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {title && <h1 className="mt-3 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>}
    </div>
  );
}
