import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/participation/practice-group");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-009"
      sections={["생활실천단 소개", "참가 대상 및 기준 인원", "활동 내용", "참여 방법"]}
      note="기존 사이트의 참가 기준 인원(소개 문단 '3인 이상' / 참가대상 '5인 이상')이 불일치하여 확인 후 게시합니다."
    />
  );
}
