import { Fragment, Suspense, type ReactNode } from "react";
import { CarbonDataSection } from "@/components/home/carbon-data-section";
import { ActivityGallery } from "@/components/home/activity-gallery";
import { HeroSection } from "@/components/home/hero-section";
import { LatestPosts } from "@/components/home/latest-posts";
import { QuickLinks } from "@/components/home/quick-links";
import { StatHighlights } from "@/components/home/stat-highlights";
import { RelatedSites } from "@/components/layout/related-sites";
import { PopupLayer } from "@/components/popup/popup-layer";
import { Container } from "@/components/ui/container";
import type { HomeSectionKey } from "@/lib/config/home-sections";
import { carbonPlan } from "@/lib/content/home-carbon";
import { getActivePopups } from "@/lib/queries/popups";
import { getLatestActivityPhotos } from "@/lib/queries/posts";
import { SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import {
  getHomeSectionOrder,
  getRelatedSites,
  getSystemChart,
  getVisibleNavigation,
  getVisibleStats,
} from "@/lib/queries/site";
import type { BoardKey, NavSection } from "@/types";

const isVisible = (navigation: NavSection[], href: string) =>
  navigation.some((s) => s.items.some((i) => i.href === href));

/** '데이터로 보는 충남 탄소중립' 아래 바로가기 (메뉴가 숨겨지면 빠진다) */
const CARBON_LINKS = [
  { href: "/carbon-neutral/emissions", label: "배출현황 자세히 보기" },
  { href: "/carbon-neutral/vision-2045", label: "2045 비전·목표" },
  { href: "/carbon-neutral/sector-targets", label: "부문별 감축목표" },
];

/**
 * 메인 — 모든 영역은 관리자 설정(메뉴 노출·사진·실적·도표)에 따라 구성되고,
 * 메인 비주얼 아래 영역의 순서는 관리자 > 메인 화면 순서에서 정한다.
 */
export default async function HomePage() {
  const [navigation, stats, relatedSites, order, carbonData, targets] = await Promise.all([
    getVisibleNavigation(),
    getVisibleStats(),
    getRelatedSites(),
    getHomeSectionOrder(),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamTotal),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamTargets),
  ]);
  const showActivity = isVisible(navigation, "/news/gallery");
  const latestBoards = (["notice", "press"] as BoardKey[]).filter((key) =>
    isVisible(navigation, `/news/${key}`),
  );
  const photos = showActivity ? await getLatestActivityPhotos(5) : [];

  const sections: Record<HomeSectionKey, ReactNode> = {
    latestPosts: latestBoards.length > 0 && (
      <div className="border-y border-border bg-muted/50">
        <Container className="grid gap-6 py-16 lg:grid-cols-2">
          {latestBoards.map((key) => (
            <LatestPosts key={key} boardKey={key} />
          ))}
        </Container>
      </div>
    ),
    activityGallery: <ActivityGallery posts={photos} />,
    quickLinks: <QuickLinks navigation={navigation} />,
    stats: <StatHighlights stats={stats} />,
    carbonData: (
      <CarbonDataSection
        data={carbonData}
        plan={carbonPlan(targets)}
        links={CARBON_LINKS.filter((link) => isVisible(navigation, link.href))}
      />
    ),
    relatedSites: relatedSites.length > 0 && (
      <Container className="py-12">
        <RelatedSites sites={relatedSites} />
      </Container>
    ),
  };

  return (
    <>
      <HeroSection navigation={navigation} />
      {order.map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}

      <Suspense>
        <HomePopups />
      </Suspense>
    </>
  );
}

async function HomePopups() {
  const popups = await getActivePopups();
  return <PopupLayer popups={popups} />;
}
