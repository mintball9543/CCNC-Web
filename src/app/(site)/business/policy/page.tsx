import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/business/policy");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-007"
      sections={[
        "정책지원 기능 소개",
        "2026년 충청남도 사업 (기후에너지환경부 공동 추진)",
        "연도별 실적 아카이브 (2024, 2025 …)",
        "온실가스 감축인지 예산제 지원",
      ]}
      note="연도별 표 누적 방식 대신 기능별 소개를 상단에, 연도별 실적은 하단 아카이브로 구성합니다."
    />
  );
}
