import { EmissionsChart } from "@/components/charts/emissions-chart";
import { chungnamEmissions } from "@/lib/content/emissions";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/emissions");

export default function Page() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        충청남도의 연도별 온실가스 배출량입니다. 수치는 공식 통계 공표 시 갱신됩니다.
      </p>
      <EmissionsChart dataset={chungnamEmissions} />
    </div>
  );
}
