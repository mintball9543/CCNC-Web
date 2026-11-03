import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/vision-2045");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-008"
      sections={[
        "충청남도 2045 탄소중립 비전",
        "부문별 목표 요약",
        "출처: 충청남도 탄소중립·녹색성장 기본계획",
      ]}
    />
  );
}
