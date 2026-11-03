import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { Tabs } from "@/components/ui/tabs";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/sector-targets");

/** 부문별 감축목표 — 기존 8개 페이지를 한 페이지 탭으로 통합 */
const sectors = ["전환", "산업", "건물", "수송", "농축수산", "폐기물", "흡수원", "이행기반"];

export default function Page() {
  return (
    <Tabs
      label="부문 선택"
      tabs={sectors.map((sector) => ({
        id: sector,
        label: sector,
        content: (
          <ContentPlaceholder
            issue="CONTENT-008"
            sections={[`${sector} 부문 감축목표`, "세부사업", "주요지표"]}
          />
        ),
      }))}
    />
  );
}
