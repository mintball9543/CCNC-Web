import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/participation/footprint");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-009"
      sections={[
        "탄소발자국 계산기 (공식 배출계수 기반)",
        "계산 결과 해설",
        "생활 속 감축 실천 안내",
      ]}
    />
  );
}
