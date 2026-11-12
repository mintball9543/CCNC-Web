import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { ChartCard } from "@/components/charts/chart-card";
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
import {
  getHomeCharts,
  getRelatedSites,
  getVisibleNavigation,
  getVisibleStats,
} from "@/lib/queries/site";
import type { BoardKey, NavSection } from "@/types";

const isVisible = (navigation: NavSection[], href: string) =>
  navigation.some((s) => s.items.some((i) => i.href === href));

/** 메인 — 모든 영역은 관리자 설정(메뉴 노출·사진·실적·도표)에 따라 구성된다 */
export default async function HomePage() {
  const [navigation, stats, charts, relatedSites] = await Promise.all([
    getVisibleNavigation(),
    getVisibleStats(),
    getHomeCharts(),
    getRelatedSites(),
  ]);
  const showActivity = isVisible(navigation, "/news/gallery");
  const latestBoards = (["notice", "press"] as BoardKey[]).filter((key) =>
    isVisible(navigation, `/news/${key}`),
  );
  const photos = showActivity ? await getLatestActivityPhotos(5) : [];

  return (
    <>
      <HeroSection />
      <QuickLinks navigation={navigation} />
      <StatHighlights stats={stats} />
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

      {isVisible(navigation, "/carbon-neutral/emissions") && (
        <Container className="pb-16">
          <Link
            href="/carbon-neutral/emissions"
            className="group flex flex-col justify-between gap-4 rounded-2xl bg-ci-navy p-8 text-white sm:flex-row sm:items-center dark:bg-card dark:ring-1 dark:ring-border"
          >
            <div>
              <p className="text-sm text-white/70 dark:text-muted-foreground">충남 탄소중립</p>
              <p className="mt-1 text-xl font-bold">충청남도 온실가스 배출현황 보기</p>
            </div>
            <ArrowRight className="size-6 transition group-hover:translate-x-1" aria-hidden />
          </Link>
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
