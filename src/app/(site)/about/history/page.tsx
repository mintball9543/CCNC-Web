import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/history");

export default function Page() {
  return (
    <div className="prose-ccnc space-y-8">
      <section>
        <h2>설립근거</h2>
        <p>
          충청남도 탄소중립지원센터는 「기후위기 대응을 위한 탄소중립·녹색성장 기본법」
          제68조(탄소중립 지원센터의 설립)에 근거하여 지정·운영됩니다.
        </p>
        <p className="text-sm text-muted-foreground">
          ※ 조문 원문 및 지정 일자·지정 기관은 국가법령정보센터 및 지정 공문 등 공식 자료로 확인 후
          게시합니다.
        </p>
      </section>
      <ContentPlaceholder
        issue="CONTENT-005"
        sections={["지원센터 지정 내역", "연혁 (연도별 주요 활동)"]}
      />
    </div>
  );
}
