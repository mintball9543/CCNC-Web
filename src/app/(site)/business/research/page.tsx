import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/business/research");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-007"
      sections={["조사연구 기능 소개", "주요 연구과제", "연도별 실적 아카이브"]}
    />
  );
}
