import { ChartCard } from "@/components/charts/chart-card";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { CHART_SLUGS } from "@/lib/config/charts";
import { getPublishedChart } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/emissions");

export default async function Page() {
  const chart = await getPublishedChart(CHART_SLUGS.emissions);
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        충청남도의 연도별 온실가스 배출량입니다. 수치는 공식 통계 공표 시 관리자 화면에서
        갱신됩니다.
      </p>
      {chart && chart.rows.length > 0 ? (
        <ChartCard dataset={chart} headingLevel={2} />
      ) : (
        <ContentPlaceholder
          issue="CONTENT-004"
          sections={[
            "연도별 총배출량 도표",
            "부문별 배출량",
            "출처: 온실가스종합정보센터 지역별 온실가스 인벤토리",
          ]}
          note="관리자 > 도표 관리에서 '표시할 메뉴'를 배출현황으로 지정한 도표를 공개하면 표시됩니다."
        />
      )}
    </div>
  );
}
