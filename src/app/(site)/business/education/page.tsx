import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/business/education");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-007"
      sections={["교육·홍보 기능 소개", "교육 프로그램", "연도별 실적 아카이브"]}
    />
  );
}
