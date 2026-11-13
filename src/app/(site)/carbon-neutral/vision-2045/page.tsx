import Link from "next/link";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { projectHref } from "@/lib/content/center-plan";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/vision-2045");

/**
 * 비전 수치·부문별 목표는 기본계획 원문 확인 후 게시 (ISSUES.md CONTENT-008).
 * 기본계획 이행·재수립 일정은 센터 사업계획서·지정 신청 발표자료 기준.
 */
export default function Page() {
  return (
    <div className="space-y-12">
      <ContentPlaceholder
        issue="CONTENT-008"
        sections={["충청남도 탄소중립 비전", "부문별 목표 요약"]}
      />
      <section aria-labelledby="plan-implementation-heading">
        <h2 id="plan-implementation-heading" className="mb-4 text-xl font-bold">
          기본계획의 이행과 재수립
        </h2>
        <ul className="space-y-4">
          <li className="rounded-2xl border border-border p-5 leading-relaxed">
            <p className="font-bold">매년 이행점검</p>
            <p className="mt-1 text-muted-foreground">
              「탄소중립기본법」 제13조에 따라 지자체는 기본계획 추진상황과 주요 성과를 매년
              정량·정성적으로 점검하고, 그 결과보고서를 지방위원회를 거쳐 기후에너지환경부에
              제출합니다. 센터는 2026년 부문별 감축사업의{" "}
              <Link
                href={projectHref({ field: "policy", code: "1-1" })}
                className="text-primary underline underline-offset-2"
              >
                이행점검을 지원
              </Link>
              합니다.
            </p>
          </li>
          <li className="rounded-2xl border border-border p-5 leading-relaxed">
            <p className="font-bold">후속 계획 수립 대응</p>
            <p className="mt-1 text-muted-foreground">
              제2차 충남 탄소중립 기본계획 수립(2027년 상반기)과 시·군별 탄소중립 기본계획
              수립(2027년 하반기)을 지원하고, 도–시·군 공통의 점검 지표체계와 환류체계를 마련합니다.
            </p>
          </li>
        </ul>
      </section>{" "}
    </div>
  );
}
