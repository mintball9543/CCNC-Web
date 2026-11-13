import { ChartCard } from "@/components/charts/chart-card";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { CHUNGNAM_EMISSION_PROFILE, projectHref } from "@/lib/content/center-plan";
import { CHART_SLUGS } from "@/lib/config/charts";
import { getPublishedChart } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/emissions");

export default async function Page() {
  const chart = await getPublishedChart(CHART_SLUGS.emissions);
  return (
    <div className="space-y-10">
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-3 text-xl font-bold">
          충남의 배출 특성
        </h2>
        <p className="leading-relaxed">{CHUNGNAM_EMISSION_PROFILE.summary}</p>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {CHUNGNAM_EMISSION_PROFILE.regions.map((r) => (
            <li key={r.title} className="rounded-2xl border border-border p-5">
              <p className="font-bold">{r.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {r.description}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          센터는 이러한 지역 유형별 특성을 반영한{" "}
          <a
            href={projectHref({ field: "information", code: "2-2" })}
            className="text-primary underline underline-offset-2"
          >
            충남형 온실가스 인벤토리
          </a>{" "}
          설계 방향을 검토하고 있습니다.
        </p>
      </section>
      <section aria-labelledby="yearly-heading" className="space-y-6">
        <h2 id="yearly-heading" className="text-xl font-bold">
          연도별 배출량
        </h2>
        <p className="text-muted-foreground">
          충청남도의 연도별 온실가스 배출량입니다. 수치는 공식 통계 공표 시 관리자 화면에서
          갱신됩니다.
        </p>
        {chart && chart.rows.length > 0 ? (
          <ChartCard dataset={chart} headingLevel={3} />
        ) : (
          <ContentPlaceholder
            issue="CONTENT-004"
            sections={["연도별 총배출량 도표", "부문별 배출량"]}
            note="관리자 > 도표 관리에서 '표시할 메뉴'를 배출현황으로 지정한 도표를 공개하면 표시됩니다."
          />
        )}
      </section>{" "}
    </div>
  );
}
