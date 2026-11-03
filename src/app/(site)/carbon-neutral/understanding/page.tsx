import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/understanding");

/** 기존 기초정보 4개(탄소중립이란·기후변화·온실가스·국가 2050)를 한 페이지로 통합 */
export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-008"
      sections={["탄소중립이란", "기후변화", "온실가스", "국가 2050 탄소중립 시나리오"]}
      note="출처 '2050 탄소중립녹색성장위원회'는 2026.1.1. '국가기후위기대응위원회'로 명칭이 변경되어 현 명칭을 병기합니다."
    />
  );
}
