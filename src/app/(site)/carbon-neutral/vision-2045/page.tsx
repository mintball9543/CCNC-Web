import Link from "next/link";
import { CHUNGNAM_2045 } from "@/lib/content/carbon-info";
import { projectHref } from "@/lib/content/center-plan";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/vision-2045");

/**
 * 비전·목표·전략은 기존 홈페이지 '충남 2045 비전 및 목표'(전략 이미지 → 텍스트)에서 옮김.
 * 기본계획 이행·재수립 일정은 센터 사업계획서·지정 신청 발표자료 기준.
 */
export default function Page() {
  return (
    <div className="space-y-12">
      <section aria-labelledby="vision-heading">
        <h2 id="vision-heading" className="mb-5 text-xl font-bold">
          비전
        </h2>
        <div className="rounded-2xl bg-ci-navy px-6 py-10 text-center text-white sm:px-10">
          <p className="text-2xl leading-snug font-bold text-balance sm:text-3xl">
            {CHUNGNAM_2045.vision}
          </p>
        </div>
      </section>
      <section aria-labelledby="goal-heading">
        <h2 id="goal-heading" className="mb-5 text-xl font-bold">
          목표
        </h2>
        <p className="text-lg leading-relaxed font-semibold">{CHUNGNAM_2045.goal}</p>
        <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
          {CHUNGNAM_2045.milestones.map((m, i) => (
            <li
              key={m.year}
              className={
                i === CHUNGNAM_2045.milestones.length - 1
                  ? "rounded-2xl bg-primary p-4 text-center text-primary-foreground sm:p-6"
                  : "rounded-2xl bg-primary-soft p-4 text-center sm:p-6"
              }
            >
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">{m.year}</p>
              <p className="mt-1 text-sm font-medium sm:text-base">{m.label}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="strategy-heading">
        <h2 id="strategy-heading" className="mb-5 text-xl font-bold">
          전략
        </h2>
        <ol className="space-y-3">
          {CHUNGNAM_2045.strategies.map((st) => (
            <li
              key={st.type}
              className="grid gap-3 rounded-2xl border border-border p-5 sm:grid-cols-[13rem_1fr] sm:items-center sm:gap-6"
            >
              <div>
                <p className="inline-block rounded-full border border-primary px-3 py-0.5 text-sm font-bold text-primary">
                  {st.type}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{st.description}</p>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl bg-muted/60 px-5 py-3">
                <p className="text-lg font-bold">{st.title}</p>
                <p className="text-muted-foreground">{st.scope}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          부문별 감축 목표와 세부사업은{" "}
          <Link
            href="/carbon-neutral/sector-targets"
            className="text-primary underline underline-offset-2"
          >
            부문별 감축목표
          </Link>
          에서 볼 수 있습니다.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">자료: {CHUNGNAM_2045.source}</p>
      </section>
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
