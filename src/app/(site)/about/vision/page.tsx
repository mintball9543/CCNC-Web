import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/vision");

export default function Page() {
  return (
    <ContentPlaceholder
      issue="CONTENT-005"
      sections={["비전", "목표", "추진전략 (기존 이미지 1장 → 텍스트 전환)"]}
    />
  );
}
