import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/participation/upsyu");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-009"
      sections={[
        "탄소업슈 소개",
        "소개 영상",
        "앱 다운로드 링크·QR 코드",
        "포인트 적립 기준 (현행 운영 기준)",
      ]}
    />
  );
}
