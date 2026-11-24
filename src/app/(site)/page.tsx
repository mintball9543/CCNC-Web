import { Suspense } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { CarbonDataSection } from "@/components/home/carbon-data-section";
import { ActivityGallery } from "@/components/home/activity-gallery";
import { HeroSection } from "@/components/home/hero-section";
import { LatestPosts } from "@/components/home/latest-posts";
import { QuickLinks } from "@/components/home/quick-links";
import { StatHighlights } from "@/components/home/stat-highlights";
import { RelatedSites } from "@/components/layout/related-sites";
import { PopupLayer } from "@/components/popup/popup-layer";
import { Container } from "@/components/ui/container";
import { getActivePopups } from "@/lib/queries/popups";
import { getLatestActivityPhotos } from "@/lib/queries/posts";
import { SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import {
  getHomeCharts,
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

/** 메인 — 모든 영역은 관리자 설정(메뉴 노출·사진·실적·도표)에 따라 구성된다 */
export default async function HomePage() {
  const [navigation, stats, charts, relatedSites, carbonData] = await Promise.all([
    getVisibleNavigation(),
    getVisibleStats(),
    getHomeCharts(),
    getRelatedSites(),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamTotal),
  ]);
  const showActivity = isVisible(navigation, "/news/gallery");
  const latestBoards = (["notice", "press"] as BoardKey[]).filter((key) =>
    isVisible(navigation, `/news/${key}`),
  );
  const photos = showActivity ? await getLatestActivityPhotos(5) : [];

  return (
    <>
      <HeroSection navigation={navigation} />
      <QuickLinks navigation={navigation} />
      <StatHighlights stats={stats} />
      <CarbonDataSection
        data={carbonData}
        links={CARBON_LINKS.filter((link) => isVisible(navigation, link.href))}
      />
      <ActivityGallery posts={photos} />

      {latestBoards.length > 0 && (
        <div className="border-y border-border bg-muted/50">
          <Container className="grid gap-6 py-16 lg:grid-cols-2">
            {latestBoards.map((key) => (
              <LatestPosts key={key} boardKey={key} />
            ))}
          </Container>
        </div>
      )}

      {charts.length > 0 && (
        <Container className="py-16">
          <h2 className="text-2xl font-bold">우리가 이뤄낸 탄소중립의 기록</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {charts.map((chart) => (
              <ChartCard key={chart.id} dataset={chart} />
            ))}
          </div>
        </Container>
      )}

      {relatedSites.length > 0 && (
        <Container className="pb-16">
          <RelatedSites sites={relatedSites} />
        </Container>
      )}

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
