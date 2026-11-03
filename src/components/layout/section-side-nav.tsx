"use client";

import { usePathname } from "next/navigation";
import { findNavItem } from "@/lib/config/navigation";
import type { NavSection } from "@/types";
import { SectionSideNavView } from "./section-side-nav-view";

/** 현재 경로를 활성 메뉴로 표시하는 LNB (Suspense 안에서 사용) */
export function SectionSideNav({ section }: { section: NavSection }) {
  const pathname = usePathname();
  return <SectionSideNavView section={section} activeHref={findNavItem(pathname)?.href ?? null} />;
}
