import Link from "next/link";
import { Menu } from "lucide-react";
import { Suspense } from "react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import type { NavSection } from "@/types";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

/** 상단 헤더 + GNB (관리자 메뉴 노출 설정이 적용된 메뉴를 받는다) */
export function SiteHeader({ navigation }: { navigation: NavSection[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header backdrop-blur">
      <Container className="flex h-18 items-center justify-between gap-6 lg:h-22">
        <Link href="/" className="shrink-0" aria-label="충청남도 탄소중립지원센터 홈">
          <BrandLockup />
        </Link>

        <Suspense fallback={<StaticNav sections={navigation} />}>
          <DesktopNav sections={navigation} />
        </Suspense>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Suspense
            fallback={
              <span
                className="inline-flex size-10 items-center justify-center lg:hidden"
                aria-hidden
              >
                <Menu className="size-6" />
              </span>
            }
          >
            <MobileNav sections={navigation} />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

/** 하이드레이션 전 GNB (대메뉴 링크만) */
function StaticNav({ sections }: { sections: NavSection[] }) {
  return (
    <nav aria-label="주 메뉴" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {sections.map((section) => (
          <li key={section.key}>
            <Link href={section.href} className="rounded-lg px-4 py-2 text-[16px] font-bold">
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
