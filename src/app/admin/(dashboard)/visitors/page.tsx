import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { DataChart } from "@/components/charts/data-chart";
import { Card } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import * as visitRepository from "@/lib/repositories/visit.repository";
import { cn } from "@/lib/utils/cn";
import {
  addDays,
  addMonths,
  fillBuckets,
  heatLevel,
  kstDay,
  lastDays,
  lastMonths,
  monthCalendar,
  parseMonth,
  yearRange,
  type VisitBucket,
} from "@/lib/visits/stats";

export const metadata = { title: "방문자 통계" };

const VIEWS = {
  day: { label: "일별", range: "최근 30일", column: "날짜" },
  month: { label: "월별", range: "최근 12개월", column: "월" },
  year: { label: "연도별", range: "집계 시작 이후", column: "연도" },
} as const;
type View = keyof typeof VIEWS;

export default function VisitorsPage(props: PageProps<"/admin/visitors">) {
  return (
    <>
      <AdminPageHeader
        title="방문자 통계"
        description="홈페이지(공개 화면) 방문자 수를 일·월·연 단위로 보여 줍니다."
      />
      <AdminSuspense>
        <Content {...props} />
      </AdminSuspense>
    </>
  );
}

const number = (n: number) => n.toLocaleString("ko-KR");

/** 달력의 월 이동 링크는 이동 후에도 달력이 보이도록 #달력 으로 */
function visitorsHref(view: View, month?: string, toCalendar = false): string {
  const params = new URLSearchParams();
  if (view !== "day") params.set("view", view);
  if (month) params.set("month", month);
  const query = params.toString();
  return `/admin/visitors${query ? `?${query}` : ""}${toCalendar ? "#visit-calendar-heading" : ""}`;
}

/** 2026-11-12 → 11.12(목) · 2026-11 → 2026년 11월 · 2026 → 2026년 */
function formatKey(key: string, short = false): string {
  if (key.length === 4) return `${key}년`;
  if (key.length === 7)
    return short ? `${Number(key.slice(5))}월` : `${key.slice(0, 4)}년 ${Number(key.slice(5))}월`;
  const label = `${Number(key.slice(5, 7))}.${Number(key.slice(8))}`;
  if (short) return label;
  const weekday = "일월화수목금토"[new Date(`${key}T00:00:00Z`).getUTCDay()];
  return `${key.slice(0, 4)}. ${label}(${weekday})`;
}

async function Content({ searchParams }: PageProps<"/admin/visitors">) {
  await requireAdmin();
  const sp = await searchParams;
  const view: View = sp.view === "month" || sp.view === "year" ? sp.view : "day";
  const today = kstDay(new Date());

  const [todayCount, yesterday, thisMonth, thisYear, total, firstYear] = await Promise.all([
    visitRepository.sumVisits(today, today),
    visitRepository.sumVisits(addDays(today, -1), addDays(today, -1)),
    visitRepository.sumVisits(`${today.slice(0, 7)}-01`, today),
    visitRepository.sumVisits(`${today.slice(0, 4)}-01-01`, today),
    visitRepository.sumVisits(),
    visitRepository.firstVisitYear(),
  ]);

  let buckets: VisitBucket[];
  if (view === "day") {
    const keys = lastDays(today, 30);
    buckets = fillBuckets(await visitRepository.groupVisits(10, keys[0]), keys);
  } else if (view === "month") {
    const keys = lastMonths(today, 12);
    buckets = fillBuckets(await visitRepository.groupVisits(7, `${keys[0]}-01`), keys);
  } else {
    const keys = yearRange(firstYear, today);
    buckets = fillBuckets(await visitRepository.groupVisits(4, `${keys[0]}-01-01`), keys);
  }
  const month = parseMonth(sp.month, today);
  const monthEnd = addDays(`${addMonths(month, 1)}-01`, -1);
  const calendarDays = await visitRepository.groupVisits(10, `${month}-01`, monthEnd);

  const summary = [
    { label: "오늘", value: todayCount },
    { label: "어제", value: yesterday },
    { label: "이번 달", value: thisMonth },
    { label: "올해", value: thisYear },
    { label: "전체", value: total },
  ];
  const { label, range, column } = VIEWS[view];
  const viewHref = (key: View) =>
    visitorsHref(key, month === today.slice(0, 7) ? undefined : month);

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {summary.map((s) => (
          <li key={s.label}>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{s.label} 방문자</p>
              <p className="mt-1 text-3xl font-bold">
                {number(s.value.visitors)}
                <span className="ml-1 text-base font-semibold">명</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                페이지 열람 {number(s.value.pageViews)}회
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <section aria-labelledby="visit-chart-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="visit-chart-heading" className="text-lg font-bold">
            {label} 방문자{" "}
            <span className="text-sm font-normal text-muted-foreground">({range})</span>
          </h2>
          <nav aria-label="집계 단위" className="flex rounded-lg border border-border p-1">
            {(Object.keys(VIEWS) as View[]).map((key) => (
              <Link
                key={key}
                href={viewHref(key)}
                aria-current={key === view ? "page" : undefined}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm transition",
                  key === view
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {VIEWS[key].label}
              </Link>
            ))}
          </nav>
        </div>

        <Card className="p-4 sm:p-6">
          <DataChart
            data={{
              title: `${label} 방문자`,
              unit: "명",
              chartType: "bar",
              categoryLabel: column,
              series: ["방문자"],
              rows: buckets.map((b) => ({ label: formatKey(b.key, true), values: [b.visitors] })),
            }}
          />
        </Card>
      </section>

      <VisitCalendar month={month} today={today} days={calendarDays} view={view} />

      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>방문자: 같은 날 같은 기기·브라우저로 여러 페이지를 보더라도 1명으로 셉니다.</li>
        <li>
          월별·연도별·합계 방문자는 일별 방문자를 더한 값입니다. (다른 날 다시 오면 다시 셉니다)
        </li>
        <li>페이지 열람: 홈페이지에서 페이지를 연 횟수입니다.</li>
        <li>검색엔진 등 자동 접속과 관리자 화면 열람은 제외합니다. 날짜는 한국 시간 기준입니다.</li>
        <li>방문자를 구분하는 정보는 하루가 지나면 지우며, 접속 IP는 저장하지 않습니다.</li>
      </ul>
    </div>
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HEAT = [
  "bg-card",
  "bg-primary/10",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary text-primary-foreground",
] as const;

/** 월별 달력 — 날짜 칸에 방문자 수, 많을수록 진한 색 */
function VisitCalendar({
  month,
  today,
  days,
  view,
}: {
  month: string;
  today: string;
  days: VisitBucket[];
  view: View;
}) {
  const byDay = new Map(days.map((d) => [d.key, d]));
  const max = Math.max(0, ...days.map((d) => d.visitors));
  const total = days.reduce(
    (acc, d) => ({ visitors: acc.visitors + d.visitors, pageViews: acc.pageViews + d.pageViews }),
    { visitors: 0, pageViews: 0 },
  );
  const currentMonth = today.slice(0, 7);
  const isCurrent = month === currentMonth;
  // 평균은 지난 날짜(이번 달은 오늘까지)로 나눈다
  const elapsed = isCurrent
    ? Number(today.slice(8))
    : Number(addDays(`${addMonths(month, 1)}-01`, -1).slice(8));
  const title = `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const navClass =
    "inline-flex h-9 items-center rounded-md border border-border px-3 text-sm transition hover:bg-muted";

  return (
    <section aria-labelledby="visit-calendar-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="visit-calendar-heading" className="scroll-mt-24 text-lg font-bold">
          {title} 방문자 달력
        </h2>
        <nav aria-label="달력 월 이동" className="flex items-center gap-2">
          <Link href={visitorsHref(view, prev, true)} className={navClass}>
            <span aria-hidden>‹</span>
            <span className="ml-1">이전 달</span>
          </Link>
          {!isCurrent && (
            <Link href={visitorsHref(view, undefined, true)} className={navClass}>
              이번 달
            </Link>
          )}
          {isCurrent ? (
            <span
              className={cn(navClass, "cursor-not-allowed opacity-40 hover:bg-transparent")}
              aria-disabled
            >
              <span className="mr-1">다음 달</span>
              <span aria-hidden>›</span>
            </span>
          ) : (
            <Link
              href={visitorsHref(view, next === currentMonth ? undefined : next, true)}
              className={navClass}
            >
              <span className="mr-1">다음 달</span>
              <span aria-hidden>›</span>
            </Link>
          )}
        </nav>
      </div>

      <Card className="p-3 sm:p-6">
        <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">합계</dt>
            <dd className="font-semibold tabular-nums">{number(total.visitors)}명</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">하루 평균</dt>
            <dd className="font-semibold tabular-nums">
              {number(Math.round(total.visitors / elapsed))}명
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">가장 많은 날</dt>
            <dd className="font-semibold tabular-nums">{max ? `${number(max)}명` : "-"}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">페이지 열람</dt>
            <dd className="font-semibold tabular-nums">{number(total.pageViews)}회</dd>
          </div>
        </dl>

        <table className="w-full table-fixed border-separate border-spacing-1 text-sm sm:border-spacing-1.5">
          <caption className="sr-only">
            {title} 날짜별 방문자 수 (색이 진할수록 방문자가 많음)
          </caption>
          <thead>
            <tr>
              {WEEKDAYS.map((w, i) => (
                <th
                  key={w}
                  scope="col"
                  className={cn(
                    "pb-1 text-xs font-medium",
                    i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : "text-muted-foreground",
                  )}
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthCalendar(month).map((week) => (
              <tr key={week.find(Boolean)}>
                {week.map((day, i) => {
                  if (!day) return <td key={`empty-${i}`} aria-hidden />;
                  const future = day > today;
                  const count = byDay.get(day) ?? { visitors: 0, pageViews: 0 };
                  const level = future ? 0 : heatLevel(count.visitors, max);
                  const date = `${Number(day.slice(5, 7))}월 ${Number(day.slice(8))}일(${WEEKDAYS[i]})`;
                  return (
                    <td
                      key={day}
                      title={
                        future
                          ? undefined
                          : `${date} 방문자 ${number(count.visitors)}명 · 페이지 열람 ${number(count.pageViews)}회`
                      }
                      className={cn(
                        "h-14 rounded-md border border-border/70 p-1 align-top sm:h-20 sm:p-2",
                        HEAT[level],
                        future && "bg-muted/40 text-muted-foreground/60",
                        day === today && "ring-2 ring-foreground ring-offset-1",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-[11px] leading-none sm:text-xs",
                          level < 4 && !future && "text-muted-foreground",
                        )}
                      >
                        {Number(day.slice(8))}
                        {day === today && <span className="sr-only"> (오늘)</span>}
                      </span>
                      {future ? null : (
                        <>
                          <span className="mt-1.5 block text-right text-sm font-bold tabular-nums sm:mt-2 sm:text-lg">
                            <span className="sr-only">방문자 </span>
                            {number(count.visitors)}
                            <span className="sr-only">명</span>
                          </span>
                          <span
                            className={cn(
                              "hidden text-right text-[11px] tabular-nums sm:block",
                              level < 4 && "text-muted-foreground",
                            )}
                          >
                            <span className="sr-only">페이지 열람 </span>
                            {number(count.pageViews)}회
                          </span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground"
          aria-hidden
        >
          <span>적음</span>
          {HEAT.map((cls) => (
            <span key={cls} className={cn("size-3.5 rounded-sm border border-border/70", cls)} />
          ))}
          <span>많음</span>
        </div>
      </Card>
    </section>
  );
}
