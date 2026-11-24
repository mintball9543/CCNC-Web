import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { StaticChart } from "@/lib/content/carbon-info";
import { type CarbonPlan, chungnamPathway, chungnamSectorShares } from "@/lib/content/home-carbon";
import { cn } from "@/lib/utils/cn";

const fmt = (v: number) =>
  v.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * 메인 '데이터로 보는 충남 탄소중립' — 배출 실적·감축 목표·부문별 비중.
 * 수치는 관리자 > 도표 관리 '충청남도 부문별 총배출량'·'충청남도 탄소중립 목표'에서 계산한다.
 */
export function CarbonDataSection({
  data,
  plan,
  links,
}: {
  /** 충청남도 부문별 총배출량 (연도별 행, 마지막 행이 최신) */
  data: StaticChart;
  /** 기준연도·감축 목표·탄소중립 연도 */
  plan: CarbonPlan;
  /** 관리자가 숨기지 않은 충남 탄소중립 메뉴 링크 */
  links: { href: string; label: string }[];
}) {
  if (data.rows.length === 0) return null;
  const unit = data.unit;
  const source = data.source ?? "";
  const pathway = chungnamPathway(data, plan);
  const firstTarget = plan.targets[0];
  const { year, total, sectors } = chungnamSectorShares(data);
  const localShare =
    Math.round(sectors.filter((s) => s.local).reduce((a, s) => a + s.share, 0) * 10) / 10;

  return (
    <section aria-labelledby="carbon-data-heading" className="bg-muted/50 py-16">
      <Container>
        <p className="text-sm font-semibold text-primary">충남 탄소중립</p>
        <h2 id="carbon-data-heading" className="mt-1 text-2xl font-bold">
          데이터로 보는 충남 탄소중립
        </h2>
        <p className="mt-2 text-muted-foreground">
          충청남도는{" "}
          {plan.targets.length > 0 &&
            `${plan.baseYear}년 대비 ${plan.targets
              .map((t) => `${t.year}년까지 온실가스 ${t.rate}% 감축`)
              .join(", ")}, `}
          {plan.netZeroYear}년 탄소중립을 목표로 합니다.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <KeyFigure label={`${year}년 총배출량`} value={fmt(total)} unit={unit} />
          {firstTarget && (
            <KeyFigure
              label={`${firstTarget.year}년 감축 목표 (${plan.baseYear}년 대비)`}
              value={`${firstTarget.rate}`}
              unit="%"
              accent
            />
          )}
          <KeyFigure label="탄소중립 실현 목표" value={plan.netZeroYear} unit="년" />
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <PathwayCard pathway={pathway} plan={plan} unit={unit} source={source} />
          <SectorCard
            year={year}
            sectors={sectors}
            localShare={localShare}
            unit={unit}
            source={source}
          />
        </div>

        {links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  {link.label}
                  <ArrowRight
                    className="size-4 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

function KeyFigure({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        accent ? "border-primary bg-primary-soft" : "border-border bg-card",
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <span className={cn("text-3xl font-bold tabular-nums", accent && "text-primary")}>
          {value}
        </span>
        <span className="ml-1 text-sm font-semibold">{unit}</span>
      </dd>
    </div>
  );
}

const BAR_AREA = "h-48 sm:h-56";

function PathwayCard({
  pathway,
  plan,
  unit,
  source,
}: {
  pathway: ReturnType<typeof chungnamPathway>;
  plan: CarbonPlan;
  unit: string;
  source: string;
}) {
  const max = Math.max(...pathway.map((p) => p.value));
  const firstPlanIdx = pathway.findIndex((p) => p.kind !== "actual");

  return (
    <figure className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-3">
      <figcaption>
        <h3 className="text-lg font-bold">{plan.netZeroYear} 탄소중립까지의 감축 경로</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          총배출량 실적(흡수원 제외)과 기본계획 목표 · 단위: {unit}
        </p>
      </figcaption>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-[var(--series-2)]" />
          배출 실적
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border-2 border-dashed border-primary bg-primary-soft" />
          감축 목표
        </li>
      </ul>

      <ol className="mt-4 flex gap-1.5 sm:gap-3">
        {pathway.map((p, i) => {
          const isBase = p.year === plan.baseYear;
          const label =
            p.kind === "actual"
              ? `${p.year}년 실적 ${fmt(p.value)} ${unit}`
              : p.kind === "target"
                ? `${p.year}년 목표 ${fmt(p.value)} ${unit} (${plan.baseYear}년 대비 ${p.rate}% 감축)`
                : `${p.year}년 목표 순배출량 0 (탄소중립)`;
          return (
            <li
              key={p.year}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center",
                i === firstPlanIdx && "border-l border-dashed border-border pl-1.5 sm:pl-3",
              )}
            >
              <span className="sr-only">{label}</span>
              <div
                className={cn("flex w-full flex-col items-center justify-end", BAR_AREA)}
                aria-hidden
              >
                {p.kind === "target" && (
                  <span className="mb-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-primary-foreground sm:text-[11px]">
                    −{p.rate}%
                  </span>
                )}
                {p.kind === "netZero" ? (
                  <>
                    <Leaf className="mb-1 size-5 text-primary" />
                    <span className="text-xs font-bold text-primary sm:text-sm">0</span>
                    <span className="mt-1 h-1 w-full max-w-10 rounded-full bg-primary" />
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "mb-1 text-[11px] font-semibold tabular-nums sm:text-xs",
                        p.kind === "target" && "text-primary",
                      )}
                    >
                      {fmt(p.value)}
                    </span>
                    <span
                      className={cn(
                        "w-full max-w-10 rounded-t-md",
                        p.kind === "actual"
                          ? cn("bg-[var(--series-2)]", !isBase && "opacity-60")
                          : "border-2 border-b-0 border-dashed border-primary bg-primary-soft",
                      )}
                      style={{ height: `${(p.value / max) * 100}%` }}
                    />
                  </>
                )}
              </div>
              <span
                className="mt-2 w-full border-t border-border pt-1.5 text-center text-[11px] text-muted-foreground tabular-nums sm:text-xs"
                aria-hidden
              >
                {p.year}
                {isBase && <span className="block font-semibold text-foreground">기준</span>}
                {p.kind === "target" && (
                  <span className="block font-semibold text-primary">목표</span>
                )}
                {p.kind === "netZero" && (
                  <span className="block text-[10px] font-semibold whitespace-nowrap text-primary sm:text-xs">
                    탄소중립
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs text-muted-foreground">
        {plan.targets.length > 0 &&
          `${plan.targets.map((t) => `${t.year}년`).join("·")} 값은 ${plan.baseYear}년 총배출량에 ${plan.targets
            .map((t) => `${t.rate}%`)
            .join("·")} 감축을 적용해 계산한 값입니다. `}
        {plan.netZeroYear}년은 순배출량(배출량 − 흡수·제거량) 0을 뜻합니다.
        <br />
        자료: {source} · {plan.source}
      </p>
    </figure>
  );
}

function SectorCard({
  year,
  sectors,
  localShare,
  unit,
  source,
}: {
  year: string;
  sectors: ReturnType<typeof chungnamSectorShares>["sectors"];
  localShare: number;
  unit: string;
  source: string;
}) {
  return (
    <figure className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
      <figcaption>
        <h3 className="text-lg font-bold">부문별 배출 비중 ({year}년)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          총배출량(흡수원 제외) 중 각 부문이 차지하는 비율
        </p>
      </figcaption>

      <ul className="mt-5 space-y-4">
        {sectors.map((s) => (
          <li key={s.sector}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold">
                {s.sector}
                {!s.local && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    지자체 관리권한 외
                  </span>
                )}
              </span>
              <span className="tabular-nums">
                <span className="font-bold">{fmt(s.share)}%</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {fmt(s.value)} {unit}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn(
                  "h-full rounded-full",
                  s.local ? "bg-primary" : "bg-[var(--series-2)]",
                )}
                style={{ width: `${Math.max(s.share, 1)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-xl bg-primary-soft p-3 text-sm">
        {sectors
          .filter((s) => s.local)
          .map((s) => s.sector)
          .join("·")}{" "}
        등 <strong>지자체 관리권한 부문</strong>이 총배출량의{" "}
        <strong className="text-primary">{fmt(localShare)}%</strong>를 차지합니다.
      </p>
      <p className="mt-auto pt-4 text-xs text-muted-foreground">자료: {source}</p>
    </figure>
  );
}
