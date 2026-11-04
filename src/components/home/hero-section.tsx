import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { getActiveHeroSlides } from "@/lib/queries/site";
import { HeroCarousel } from "./hero-carousel";

const TITLE = "도민과 함께 만드는 충남의 탄소중립";

/** 메인 비주얼 — 관리자 > 메인 비주얼에 사진이 있으면 슬라이드, 없으면 CI 패턴 */
export async function HeroSection() {
  const slides = await getActiveHeroSlides();
  if (slides.length > 0) {
    return (
      <HeroCarousel
        slides={slides}
        fallbackTitle={TITLE}
        fallbackSubtitle={siteConfig.description}
      />
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-soft via-background to-background">
      <CiPattern />
      <Container className="relative py-16 lg:py-24">
        <p className="text-sm font-semibold tracking-wider text-primary">
          {siteConfig.englishName.toUpperCase()}
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
          도민과 함께 만드는
          <br />
          <span className="text-primary">충남의 탄소중립</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground lg:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/business/policy" size="lg">
            주요사업 보기
          </ButtonLink>
          <ButtonLink href="/news/center-news" size="lg" variant="secondary">
            센터 활동 보기
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/** CI 심볼의 3×3 타일 모티프 장식 */
function CiPattern() {
  const tiles = [
    "bg-ci-green-1",
    "bg-ci-green-2",
    "bg-ci-gray",
    "bg-ci-green-3",
    null,
    "ring",
    "bg-ci-green-4",
    "bg-ci-green-5",
    "bg-ci-lime",
  ];
  return (
    <div
      className="pointer-events-none absolute top-1/2 right-[-4rem] hidden -translate-y-1/2 grid-cols-3 gap-4 opacity-25 md:grid lg:right-12 lg:opacity-90"
      aria-hidden
    >
      {tiles.map((tile, i) =>
        tile === "ring" ? (
          <div key={i} className="flex size-24 items-center justify-center">
            <div className="size-20 rounded-full border-[14px] border-ci-ring" />
          </div>
        ) : (
          <div key={i} className={`size-24 rounded-3xl ${tile ?? "bg-transparent"}`} />
        ),
      )}
    </div>
  );
}
