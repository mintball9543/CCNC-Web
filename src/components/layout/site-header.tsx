import Link from "next/link";
import { Menu } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/lib/config/navigation";
import { MobileNav } from "./mobile-nav";

/** 상단 헤더 + GNB (데스크톱: hover/focus 드롭다운, 모바일: 드로어) */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="shrink-0" aria-label="충청남도 탄소중립지원센터 홈">
          <Logo variant="horizontal" priority className="h-9 lg:h-11" />
        </Link>

        <nav aria-label="주 메뉴" className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-1">
            {mainNavigation.map((section) => (
              <li key={section.key} className="group relative flex h-full items-center">
                <Link
                  href={section.href}
                  className="rounded-lg px-4 py-2 text-[15px] font-semibold transition hover:text-primary"
                >
                  {section.title}
                </Link>
                <div className="invisible absolute top-full left-1/2 w-52 -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-xl border border-border bg-card p-2 shadow-lg">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>

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
            <MobileNav sections={mainNavigation} />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
