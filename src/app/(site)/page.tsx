import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { LatestPosts } from "@/components/home/latest-posts";
import { QuickLinks } from "@/components/home/quick-links";
import { PopupLayer } from "@/components/popup/popup-layer";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/feedback";
import { getActivePopups } from "@/lib/queries/popups";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickLinks />

      <div className="border-y border-border bg-muted/50">
        <Container className="grid gap-6 py-16 lg:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-72" />}>
            <LatestPosts boardKey="notice" />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-72" />}>
            <LatestPosts boardKey="center-news" />
          </Suspense>
        </Container>
      </div>

      <Container className="py-16">
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
