import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/feedback";
import { mainNavigation } from "@/lib/config/navigation";
import { getVisibleNavigation } from "@/lib/queries/site";
import { PageHeading } from "./page-heading";
import { SectionSideNav } from "./section-side-nav";
import { SectionSideNavView } from "./section-side-nav-view";

/**
 * 서브 페이지 공통 레이아웃: 서브 비주얼 + 좌측 메뉴(LNB) + 위치표시/제목 + 본문.
 * 관리자 메뉴 노출 설정을 적용한다 — 숨긴 메뉴는 LNB 에서 빠진다.
 * 숨긴 페이지에 직접 접근하는 경우는 proxy.ts 가 렌더링 전에 404 로 처리한다.
 */
export async function SectionLayout({
  sectionKey,
  children,
}: {
  sectionKey: string;
  children: ReactNode;
}) {
  if (!mainNavigation.some((s) => s.key === sectionKey))
    throw new Error(`Unknown navigation section: ${sectionKey}`);
  const navigation = await getVisibleNavigation();
  const section = navigation.find((s) => s.key === sectionKey);
  if (!section) notFound();

  return (
    <>
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-soft via-background to-background">
        <Container className="relative py-10 lg:py-14">
          <p className="text-sm font-semibold text-primary">{section.title}</p>
          <p className="mt-2 text-lg text-muted-foreground">{section.description}</p>
        </Container>
      </div>
      <Container className="flex flex-col gap-8 py-8 lg:flex-row lg:gap-12 lg:py-12">
        <aside className="lg:w-56 lg:shrink-0">
          {/* 현재 경로(usePathname)는 동적 경로에서 요청 시점에만 알 수 있으므로 Suspense 로 감싼다 */}
          <Suspense fallback={<SectionSideNavView section={section} activeHref={null} />}>
            <SectionSideNav section={section} />
          </Suspense>
        </aside>
        <div className="min-w-0 flex-1">
          <Suspense fallback={<Skeleton className="mb-8 h-20" />}>
            <PageHeading />
          </Suspense>
          {children}
        </div>
      </Container>
    </>
  );
}
