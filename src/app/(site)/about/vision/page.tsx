import Link from "next/link";
import {
  CENTER_VISION,
  PLAN_FIELDS,
  projectHref,
  projectsForField,
} from "@/lib/content/center-plan";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/vision");

/** 비전·목표 — 비전·기본방향·사업 분야(운영 전략) */
export default function Page() {
  return (
    <div className="space-y-14">
      <section aria-labelledby="vision-heading">
        <h2 id="vision-heading" className="mb-5 text-xl font-bold">
          비전
        </h2>
        <div className="rounded-2xl bg-ci-navy px-6 py-10 text-center text-white sm:px-10">
          <p className="text-2xl leading-snug font-bold text-balance sm:text-3xl">
            {CENTER_VISION.statement}
          </p>
        </div>
        <p className="mt-5 leading-relaxed">{CENTER_VISION.description}</p>
      </section>
      <section aria-labelledby="direction-heading">
        <h2 id="direction-heading" className="mb-5 text-xl font-bold">
          기본방향
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {CENTER_VISION.directions.map((d, i) => (
            <li key={d.title} className="rounded-2xl border border-border p-6">
              <p className="font-mono text-sm font-semibold text-primary">0{i + 1}</p>
              <p className="mt-1 text-lg font-bold">{d.title}</p>
              <p className="mt-2 text-muted-foreground">{d.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="fields-heading">
        <h2 id="fields-heading" className="text-xl font-bold">
          운영 전략과 2026년 사업
        </h2>
        <p className="mt-2 mb-5 text-muted-foreground">
          정책연구·정보관리·소통·협력·센터운영의 네 축으로 2026년 11개 사업을 추진합니다. 사업명을
          누르면 자세한 내용으로 이동합니다.
        </p>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLAN_FIELDS.map((field) => (
            <li key={field.key} className="flex flex-col rounded-2xl border border-border p-6">
              <p className="text-sm font-semibold text-primary">{field.numeral}</p>
              <p className="text-lg font-bold">{field.title}</p>
              <p className="mt-1 text-muted-foreground">{field.summary}</p>
              <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                {projectsForField(field.key).map((p) => (
                  <li key={p.code}>
                    <Link href={projectHref(p)} className="group flex gap-2 hover:text-primary">
                      <span className="font-mono text-sm font-semibold text-primary">{p.code}</span>
                      <span className="group-hover:underline group-hover:underline-offset-2">
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>{" "}
    </div>
  );
}
