import { ChartCard } from "@/components/charts/chart-card";
import { StaticChartCard } from "@/components/charts/static-chart-card";
import { InfoTable } from "@/components/content/info-table";
import { MenuLink } from "@/components/layout/menu-link";
import {
  CHUNGNAM_EMISSION_DEFINITIONS,
  CHUNGNAM_TOTAL_FOOTNOTES,
  CHUNGNAM_TOTAL_NOTES,
} from "@/lib/content/carbon-info";
import { CHUNGNAM_EMISSION_PROFILE, projectHref } from "@/lib/content/center-plan";
import {
  chungnamLocalChart,
  chungnamTotalChart,
  chungnamTotalTable,
  localOutlookTable,
} from "@/lib/content/emission-views";
import { CHART_SLUGS, SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import { getPublishedChart, getSystemChart } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/emissions");

export default async function Page() {
  // 표·도표 수치는 관리자 > 도표 관리 '홈페이지에 고정된 도표·자료'에서 수정한다
  const [chart, total, directIndirect, outlook] = await Promise.all([
    getPublishedChart(CHART_SLUGS.emissions),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamTotal),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamDirectIndirect),
    getSystemChart(SYSTEM_CHART_SLUGS.chungnamLocalOutlook),
  ]);
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
          <MenuLink
            href={projectHref({ field: "information", code: "2-2" })}
            className="text-primary underline underline-offset-2"
          >
            충남형 온실가스 인벤토리
          </MenuLink>{" "}
          설계 방향을 검토하고 있습니다.
        </p>
      </section>
      {/* 관리자 > 도표 관리에서 '배출현황'으로 지정해 공개한 최신 도표 (ISSUES.md CONTENT-004) */}
      {chart && chart.rows.length > 0 && (
        <section aria-labelledby="yearly-heading" className="space-y-4">
          <h2 id="yearly-heading" className="text-xl font-bold">
            연도별 배출량
          </h2>
          <ChartCard dataset={chart} headingLevel={3} />
        </section>
      )}

      <section aria-labelledby="status-heading" className="space-y-5">
        <h2 id="status-heading" className="text-xl font-bold">
          충청남도 온실가스 배출 현황
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {CHUNGNAM_EMISSION_DEFINITIONS.map((d) => (
            <div key={d.term} className="rounded-2xl border border-border p-5">
              <dt className="font-bold text-primary">{d.term}</dt>
              <dd className="mt-1 text-muted-foreground">{d.description}</dd>
            </div>
          ))}
        </dl>
        <StaticChartCard chart={directIndirect} />
      </section>

      <section aria-labelledby="total-heading" className="space-y-5">
        <h2 id="total-heading" className="text-xl font-bold">
          충청남도 온실가스 총배출량 현황
        </h2>
        <ul className="space-y-2">
          {CHUNGNAM_TOTAL_NOTES.map((n) => (
            <li key={n} className="relative pl-4 leading-relaxed">
              <span
                className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-primary/60"
                aria-hidden
              />
              {n}
            </li>
          ))}
        </ul>
        <div className="space-y-1 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
          {CHUNGNAM_TOTAL_FOOTNOTES.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
        <InfoTable table={chungnamTotalTable(total)} />
        <StaticChartCard chart={chungnamTotalChart(total)} />
      </section>

      <section aria-labelledby="local-heading" className="space-y-5">
        <h2 id="local-heading" className="text-xl font-bold">
          지자체 관리권한 부문별 배출량
        </h2>
        <StaticChartCard chart={chungnamLocalChart(total)} />
      </section>

      <section aria-labelledby="outlook-heading" className="space-y-5">
        <h2 id="outlook-heading" className="text-xl font-bold">
          지자체 관리권한 부문별 배출량 전망
        </h2>
        {outlook.description && <p className="text-lg font-semibold">{outlook.description}</p>}
        <InfoTable table={localOutlookTable(outlook)} />
      </section>
    </div>
  );
}
