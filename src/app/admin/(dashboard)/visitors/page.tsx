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
  fillBuckets,
  kstDay,
  lastDays,
  lastMonths,
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
  const periodTotal = buckets.reduce(
    (acc, b) => ({ visitors: acc.visitors + b.visitors, pageViews: acc.pageViews + b.pageViews }),
    { visitors: 0, pageViews: 0 },
  );

  const summary = [
    { label: "오늘", value: todayCount },
    { label: "어제", value: yesterday },
    { label: "이번 달", value: thisMonth },
    { label: "올해", value: thisYear },
    { label: "전체", value: total },
  ];
  const { label, range, column } = VIEWS[view];

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
                href={key === "day" ? "/admin/visitors" : `/admin/visitors?view=${key}`}
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

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[420px] text-sm">
            <caption className="sr-only">
              {label} 방문자 수와 페이지 열람 수 ({range}, 최근 순)
            </caption>
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  {column}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  방문자
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  페이지 열람
                </th>
              </tr>
            </thead>
            <tbody>
              {[...buckets].reverse().map((b) => (
                <tr key={b.key} className="border-b border-border last:border-0">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    {formatKey(b.key)}
                  </th>
                  <td className="px-4 py-2.5 text-right tabular-nums">{number(b.visitors)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                    {number(b.pageViews)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border font-semibold">
              <tr>
                <th scope="row" className="px-4 py-3 text-left">
                  합계
                </th>
                <td className="px-4 py-3 text-right tabular-nums">
                  {number(periodTotal.visitors)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {number(periodTotal.pageViews)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

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
