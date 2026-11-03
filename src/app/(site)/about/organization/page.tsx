import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/organization");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-006"
      sections={[
        "조직도 (운영위원회 포함)",
        "부서·담당별 업무",
        "연락처 (기관 도메인 이메일로 통일)",
      ]}
    />
  );
}
