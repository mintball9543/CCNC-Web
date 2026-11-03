import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/participation/instructors");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-009"
      sections={["탄소중립 교육 강사단 운영 개요", "강사 소개", "교육 요청 안내"]}
      note="강사 개인정보(나이·성별) 공개 범위는 검토 후 결정합니다."
    />
  );
}
