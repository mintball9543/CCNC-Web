import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { StaticChartCard } from "@/components/charts/static-chart-card";
import { InfoTable } from "@/components/content/info-table";
import { PageToc } from "@/components/content/page-toc";
import {
  CARBON_NEUTRAL_BACKGROUND,
  CARBON_NEUTRAL_DEFINITION,
  CLIMATE_TIMELINE,
  GHG_DEFINITION,
  GHG_PROPERTIES_TABLE,
  GHG_SHARE_FACTS,
  GHG_SOURCES_TABLE,
  GHG_TERMS,
  HUMAN_CAUSES,
  NATIONAL_SCENARIO_TABLE,
  NATIONAL_STRATEGY,
  NATURAL_CAUSES,
} from "@/lib/content/carbon-info";
import { CONTENT_TABLE_SLUGS, SYSTEM_CHART_SLUGS } from "@/lib/config/charts";
import { contentTableMinWidth, toInfoTable } from "@/lib/content/content-tables";
import { getContentTable, getSystemChart } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/understanding");

const SECTIONS = [
  { id: "carbon-neutral", title: "탄소중립이란" },
  { id: "climate-change", title: "기후변화" },
  { id: "greenhouse-gas", title: "온실가스" },
  { id: "national-2050", title: "국가 2050 탄소중립" },
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 space-y-8">
      <h2 id={`${id}-heading`} className="border-b-2 border-foreground pb-3 text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-lg font-bold">{children}</h3>;
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
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

/** 탄소중립 모식도 — 이미지 대신 막대 비교로 표현 */
function NetZeroDiagram() {
  const { now, future, source } = CARBON_NEUTRAL_DEFINITION.diagram;
  return (
    <figure className="rounded-2xl border border-border p-5 sm:p-6">
      <figcaption className="mb-5 font-bold">탄소중립 모식도</figcaption>
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { ...now, emissionH: "h-44", absorptionH: "h-20" },
          { ...future, emissionH: "h-24", absorptionH: "h-24" },
        ].map((col) => (
          <div key={col.label} className="flex flex-col rounded-xl bg-muted/50 p-4">
            <p className="text-center font-semibold">{col.label}</p>
            <div className="mt-4 flex h-48 items-end justify-center gap-6 border-b border-border">
              <div className="flex w-20 flex-col items-center gap-1">
                <ArrowUp className="size-4" style={{ color: "var(--series-3)" }} aria-hidden />
                <div
                  className={`w-full rounded-t-md ${col.emissionH}`}
                  style={{ background: "var(--series-3)" }}
                />
              </div>
              <div className="flex w-20 flex-col items-center gap-1">
                <ArrowDown className="size-4 text-primary" aria-hidden />
                <div className={`w-full rounded-t-md bg-primary ${col.absorptionH}`} />
              </div>
            </div>
            <div className="mt-2 flex justify-center gap-6 text-center text-sm">
              <span className="w-20">{col.emission}</span>
              <span className="w-20">{col.absorption}</span>
            </div>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
              {col.result}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">자료: {source}</p>
    </figure>
  );
}

/** 탄소중립 이해 — 기존 기초정보 4개 페이지(탄소중립이란·기후변화·온실가스·국가 2050)를 통합 */
export default async function Page() {
  // 도표 수치는 관리자 > 도표 관리 '홈페이지에 고정된 도표·자료'에서 수정한다
  const [koreaSector, nationalTarget, koreaTable, worldTable] = await Promise.all([
    getSystemChart(SYSTEM_CHART_SLUGS.koreaSectorEmissions),
    getSystemChart(SYSTEM_CHART_SLUGS.nationalTarget),
    getContentTable(CONTENT_TABLE_SLUGS.koreaSectorEmissions),
    getContentTable(CONTENT_TABLE_SLUGS.worldRanking),
  ]);
  return (
    <div className="space-y-16">
      <PageToc items={SECTIONS} />

      {/* 01 탄소중립이란 */}
      <Section id={SECTIONS[0].id} title={SECTIONS[0].title}>
        <div>
          <SubHeading>탄소중립의 정의</SubHeading>
          <p className="leading-relaxed">{CARBON_NEUTRAL_DEFINITION.summary}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {CARBON_NEUTRAL_DEFINITION.pillars.map((p) => (
              <li key={p.title} className="rounded-2xl border border-border p-5">
                <p className="font-bold text-primary">{p.title}</p>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <NetZeroDiagram />
        <div>
          <SubHeading>탄소중립 추진 배경</SubHeading>
          <ol className="mb-6 grid gap-3 sm:grid-cols-4">
            {CLIMATE_TIMELINE.map((t) => (
              <li key={t.year} className="rounded-xl border-t-4 border-primary bg-muted/50 p-4">
                <p className="text-sm font-bold text-primary">{t.year}</p>
                <p className="mt-1 text-sm leading-relaxed">{t.text}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-4">
            {CARBON_NEUTRAL_BACKGROUND.map((b) => (
              <div key={b.title}>
                <p className="font-semibold">{b.title}</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 02 기후변화 */}
      <Section id={SECTIONS[1].id} title={SECTIONS[1].title}>
        <div className="space-y-8">
          <SubHeading>자연적인 기후변화 원인</SubHeading>
          {NATURAL_CAUSES.map((cause) => (
            <div key={cause.title} className="space-y-4">
              <p className="text-lg font-semibold text-primary">{cause.title}</p>
              <Bullets items={cause.paragraphs} />
              {"cycles" in cause && (
                <>
                  <ul className="grid gap-3 sm:grid-cols-3" aria-label="밀란코비치 주기">
                    {cause.cycles.map((c) => (
                      <li key={c.symbol} className="rounded-xl border border-border p-4">
                        <p className="flex items-baseline gap-2">
                          <span className="font-mono text-xl font-bold text-primary">
                            {c.symbol}
                          </span>
                          <span className="font-semibold">{c.name}</span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">변화 주기 {c.period}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl bg-muted/50 p-5">
                    <p className="font-semibold">{cause.iceCore.title}</p>
                    <div className="mt-2 text-sm">
                      <Bullets items={cause.iceCore.points} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      자료: {cause.iceCore.source}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <SubHeading>인위적인 기후변화 원인</SubHeading>
          <Bullets items={HUMAN_CAUSES.paragraphs} />
          <ul className="grid gap-4 md:grid-cols-2">
            {HUMAN_CAUSES.trends.map((t) => (
              <li key={t.title} className="flex flex-col rounded-2xl border border-border p-5">
                <p className="font-bold">{t.title}</p>
                <dl className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                  <div className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-xs text-muted-foreground">{t.from.label}</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">{t.from.value}</dd>
                  </div>
                  <span aria-hidden className="text-muted-foreground">
                    →
                  </span>
                  <div className="rounded-xl bg-primary-soft p-3">
                    <dt className="text-xs text-muted-foreground">{t.to.label}</dt>
                    <dd className="mt-1 text-lg font-bold text-primary tabular-nums">
                      {t.to.value}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
                <p className="mt-auto pt-3 text-xs text-muted-foreground">자료: {t.source}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">※ 수치는 그래프에서 읽은 대략값입니다.</p>
        </div>
      </Section>

      {/* 03 온실가스 */}
      <Section id={SECTIONS[2].id} title={SECTIONS[2].title}>
        <div>
          <SubHeading>온실가스란</SubHeading>
          <p className="leading-relaxed">{GHG_DEFINITION}</p>
        </div>
        <div>
          <SubHeading>온실가스 종류별 발생원</SubHeading>
          <InfoTable table={GHG_SOURCES_TABLE} />
        </div>
        <div>
          <SubHeading>온실가스의 특성</SubHeading>
          <InfoTable table={GHG_PROPERTIES_TABLE} />
        </div>
        <dl className="grid gap-4 md:grid-cols-2">
          {GHG_TERMS.map((t) => (
            <div key={t.term} className="rounded-2xl border border-border p-5">
              <dt className="font-bold text-primary">{t.term}</dt>
              <dd className="mt-1.5 leading-relaxed text-muted-foreground">{t.description}</dd>
            </div>
          ))}
        </dl>
        <div>
          <SubHeading>전 세계와 우리나라의 온실가스 구성</SubHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {GHG_SHARE_FACTS.map((g) => (
              <div key={g.scope} className="rounded-2xl border border-border p-5">
                <p className="font-bold">{g.scope}</p>
                <ul className="mt-3 space-y-2">
                  {g.items.map((item) => (
                    <li key={item.label} className="flex items-baseline justify-between gap-4">
                      <span>
                        {item.label}
                        {"note" in item && (
                          <span className="block text-xs text-muted-foreground">{item.note}</span>
                        )}
                      </span>
                      <strong className="shrink-0 text-lg text-primary tabular-nums">
                        {item.value}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <SubHeading>{koreaTable.title}</SubHeading>
          {koreaTable.description && <p className="leading-relaxed">{koreaTable.description}</p>}
          <InfoTable
            table={toInfoTable(
              koreaTable,
              contentTableMinWidth(CONTENT_TABLE_SLUGS.koreaSectorEmissions),
            )}
          />
          <StaticChartCard chart={koreaSector} headingLevel={4} />
        </div>
        <div>
          <SubHeading>{worldTable.title}</SubHeading>
          {worldTable.description && (
            <p className="mb-4 leading-relaxed">{worldTable.description}</p>
          )}
          <InfoTable
            table={toInfoTable(worldTable, contentTableMinWidth(CONTENT_TABLE_SLUGS.worldRanking))}
            className="max-w-xl"
          />
        </div>
      </Section>

      {/* 04 국가 2050 탄소중립 */}
      <Section id={SECTIONS[3].id} title={SECTIONS[3].title}>
        <div className="space-y-5">
          <SubHeading>{NATIONAL_STRATEGY.title}</SubHeading>
          <dl className="space-y-3">
            <div className="flex flex-col gap-1 rounded-2xl border border-border p-5 sm:flex-row sm:gap-6">
              <dt className="shrink-0 font-bold text-primary sm:w-20">국가비전</dt>
              <dd className="leading-relaxed">{NATIONAL_STRATEGY.vision}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-primary-soft p-5 sm:flex-row sm:gap-6">
              <dt className="shrink-0 font-bold text-primary sm:w-20">전략목표</dt>
              <dd className="text-lg font-bold">“{NATIONAL_STRATEGY.goal}”</dd>
            </div>
          </dl>
          <div>
            <p className="mb-3 text-center font-semibold">3대 정책방향</p>
            <ul className="grid gap-3 md:grid-cols-3">
              {NATIONAL_STRATEGY.directions.map((d) => (
                <li key={d.title} className="rounded-2xl border border-border p-5 text-center">
                  <p className="font-bold text-primary">{d.title}</p>
                  <p className="mt-2 border-t border-border pt-2 text-sm text-muted-foreground">
                    {d.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-center font-semibold">4대 전략 · 12대 과제</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {NATIONAL_STRATEGY.strategies.map((s, si) => (
                <li key={s.title} className="overflow-hidden rounded-2xl border border-border">
                  <div className="bg-ci-navy px-5 py-4 text-white">
                    <p className="text-sm opacity-80">{s.lead}</p>
                    <p className="text-lg font-bold">{s.title}</p>
                  </div>
                  <ol className="space-y-2 p-5">
                    {s.tasks.map((t, ti) => (
                      <li key={t} className="flex gap-3 leading-relaxed">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {si * 3 + ti + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-5 sm:flex-row sm:items-center sm:gap-6">
            <p className="shrink-0 font-bold">이행기반</p>
            <ul className="space-y-1.5">
              {NATIONAL_STRATEGY.foundations.map((f) => (
                <li key={f.text} className="flex flex-wrap items-center gap-2">
                  {f.text}
                  <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {f.cycle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">자료: {NATIONAL_STRATEGY.source}</p>
        </div>
        <div>
          <SubHeading>정부 탄소중립 목표</SubHeading>
          <StaticChartCard chart={nationalTarget} headingLevel={4} />
        </div>
        <div>
          <SubHeading>정부 2050 탄소중립 시나리오</SubHeading>
          <InfoTable table={NATIONAL_SCENARIO_TABLE} />
        </div>
      </Section>
    </div>
  );
}
