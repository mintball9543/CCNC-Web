import type { StaticChart } from "@/lib/content/carbon-info";
import { DataChart } from "./data-chart";

/** 코드에 고정된 콘텐츠 도표 카드 (관리자 도표 관리와 같은 DataChart 사용) */
export function StaticChartCard({
  chart,
  headingLevel = 3,
}: {
  chart: StaticChart;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 4 ? "h4" : "h3";
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <Heading className="text-lg font-bold">{chart.title}</Heading>
      {chart.description && (
        <p className="mt-1 text-sm text-muted-foreground">{chart.description}</p>
      )}
      <DataChart data={chart} className="mt-4" />
      {chart.source && <p className="mt-3 text-xs text-muted-foreground">자료: {chart.source}</p>}
    </section>
  );
}
