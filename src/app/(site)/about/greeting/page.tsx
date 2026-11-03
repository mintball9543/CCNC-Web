import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/greeting");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-005"
      sections={[
        "센터장 인사말 (센터장 명의 표기)",
        "인사말 본문 오탈자 수정 반영",
        "CO₂ 농도 등 수치는 최신 공식 통계로 갱신",
      ]}
    />
  );
}
