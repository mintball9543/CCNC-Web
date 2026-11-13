import { Building2, CalendarRange, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  COMMITTEE,
  FIELD_DUTIES,
  PLAN_FIELDS,
  projectHref,
  projectsForField,
  type PlanFieldKey,
  type PlanProject,
} from "@/lib/content/center-plan";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-border py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
      <dt className="font-semibold text-primary">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="relative pl-4 leading-relaxed">
          <span
            className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-primary/60"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScheduleTable({ project }: { project: PlanProject }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{project.title} 추진 일정</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">시기</th>
          <th scope="col">내용</th>
        </tr>
      </thead>
      <tbody>
        {project.schedule.map((s) => (
          <tr key={s.when} className="border-b border-border last:border-0">
            <th
              scope="row"
              className="w-24 bg-muted/60 px-3 py-2.5 align-top font-semibold whitespace-nowrap"
            >
              {s.when}
            </th>
            <td className="px-3 py-2.5">
              <p className="font-medium">{s.items[0]}</p>
              {s.items.length > 1 && (
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {s.items.slice(1).map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * 사업 1건 — 목적·사업 내용은 바로 보이고,
 * 추진 배경·사업 대상·기대효과·추진 일정은 '자세히 보기'를 펼쳐서 본다.
 */
export function PlanProjectArticle({ project }: { project: PlanProject }) {
  const headingId = `project-${project.code}-heading`;
  return (
    <article
      id={`project-${project.code}`}
      aria-labelledby={headingId}
      className="scroll-mt-24 rounded-2xl border border-border p-5 sm:p-7"
    >
      <h3 id={headingId} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xl font-bold">
        <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-base text-primary-foreground">
          {project.code}
        </span>
        <span>{project.title}</span>
        {project.tag && (
          <span className="rounded-full bg-ci-lime/25 px-2.5 py-0.5 text-sm font-semibold">
            {project.tag}
          </span>
        )}
      </h3>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarRange className="size-4" aria-hidden />
          {project.period}
        </span>
        {project.partner && (
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4" aria-hidden />
            수행기관 {project.partner}
          </span>
        )}
      </p>

      <dl className="mt-4">
        <Row label="목적">
          <Bullets items={project.purpose} />
        </Row>
        <Row label="사업 내용">
          <Bullets items={project.activities} />
        </Row>
      </dl>

      <details className="group border-t border-border">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-1 pt-4 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">추진 배경·기대효과·일정 자세히 보기</span>
          <span className="hidden group-open:inline">접기</span>
          <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden />
        </summary>
        <dl className="mt-4">
          <Row label="추진 배경">
            <Bullets items={project.background} />
          </Row>
          {project.targets.length > 0 && (
            <Row label="사업 대상">
              <Bullets items={project.targets} />
            </Row>
          )}
          {project.extra && (
            <Row label={project.extra.title}>
              <Bullets items={project.extra.items} />
            </Row>
          )}
          <Row label="기대효과">
            <Bullets items={project.effects} />
          </Row>
          <Row label="추진 일정">
            <ScheduleTable project={project} />
          </Row>
        </dl>
      </details>
    </article>
  );
}

/** 주요사업 페이지 — 운영 전략 한 줄 + 2026년 사업(번호 순) */
export function BusinessPlanPage({ field }: { field: PlanFieldKey }) {
  const strategy = PLAN_FIELDS.find((f) => f.key === field)!;
  const projects = projectsForField(field);
  return (
    <div className="space-y-8">
      <p className="border-l-4 border-primary pl-4 text-lg leading-relaxed">{strategy.summary}</p>
      <section aria-labelledby="plan-2026-heading" className="space-y-5">
        <h2 id="plan-2026-heading" className="text-xl font-bold">
          2026년 사업
        </h2>
        {projects.map((p) => (
          <PlanProjectArticle key={p.code} project={p} />
        ))}
      </section>
    </div>
  );
}

/** 조직·업무 — 분야별 담당 업무와 운영위원회 */
export function CenterWorkAreas() {
  return (
    <div className="space-y-12">
      <section aria-labelledby="work-areas-heading">
        <h2 id="work-areas-heading" className="mb-4 text-xl font-bold">
          분야별 주요 업무
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLAN_FIELDS.map((field) => (
            <li key={field.key} className="rounded-2xl border border-border p-5">
              <p className="mb-3 font-bold">{field.title}</p>
              <Bullets items={FIELD_DUTIES[field.key]} />
              <p className="mt-4 border-t border-border pt-3 text-sm font-semibold text-muted-foreground">
                2026년 사업
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {projectsForField(field.key).map((p) => (
                  <li key={p.code}>
                    <Link href={projectHref(p)} className="flex gap-2 hover:text-primary">
                      <span className="font-mono font-semibold text-primary">{p.code}</span>
                      <span>{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="committee-heading">
        <h2 id="committee-heading" className="mb-4 text-xl font-bold">
          운영위원회
        </h2>
        <p className="leading-relaxed">{COMMITTEE.selection}</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {COMMITTEE.roles.map((role, i) => (
            <li key={role} className="rounded-2xl bg-muted/60 p-4">
              <p className="font-mono text-sm font-semibold text-primary">0{i + 1}</p>
              <p className="mt-1 font-medium">{role}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 overflow-x-auto border-t-2 border-foreground">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">운영위원 명단</caption>
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th scope="col" className="py-3">
                  성명
                </th>
                <th scope="col" className="py-3">
                  소속
                </th>
                <th scope="col" className="py-3">
                  직위
                </th>
                <th scope="col" className="py-3">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMITTEE.members.map((m) => (
                <tr key={m.name} className="border-b border-border">
                  <th scope="row" className="px-2 py-3 text-center font-medium">
                    {m.name}
                  </th>
                  <td className="px-2 py-3 text-center">{m.org}</td>
                  <td className="px-2 py-3 text-center">{m.position}</td>
                  <td className="px-2 py-3 text-muted-foreground">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
