import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/business/network");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-007"
      sections={["탄소중립협의회 등 거버넌스", "협력 네트워크", "연도별 실적 아카이브"]}
    />
  );
}
