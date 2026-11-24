import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { requireAdmin } from "@/lib/auth/guard";
import { CONTENT_TABLES, SYSTEM_CHARTS } from "@/lib/config/charts";
import { allSystemChartDefaults } from "@/lib/content/system-charts";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "도표 관리" };

export default function ChartsAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="도표 관리"
        description="홈페이지에 들어간 도표·표의 수치를 고칩니다. 새 자료(연도)가 나오면 행이나 열을 추가하세요. 저장하면 홈페이지에 바로 반영됩니다."
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

const TH = "px-4 py-3";

async function Content() {
  await requireAdmin();
  // DB 에 없는 도표·자료는 기존 화면 값으로 넣어 둔다 (이미 있으면 그대로)
  await settingsRepository.ensureSystemCharts(allSystemChartDefaults());
  const charts = await settingsRepository.listCharts();
  const bySlug = new Map(charts.map((c) => [c.slug, c]));
  const tables = await Promise.all(
    CONTENT_TABLES.map(async (t) => ({
      config: t,
      saved: await settingsRepository.findContentTable(t.slug),
    })),
  );

  return (
    <div className="space-y-10">
      <section aria-labelledby="charts-heading" className="space-y-3">
        <div>
          <h2 id="charts-heading" className="text-lg font-bold">
            도표·수치 자료
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            숫자로 입력하면 도표와 표, 메인 화면 수치가 함께 바뀝니다.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/60 text-left">
              <tr>
                <th scope="col" className={TH}>
                  자료
                </th>
                <th scope="col" className={TH}>
                  쓰이는 곳
                </th>
                <th scope="col" className={TH}>
                  데이터
                </th>
                <th scope="col" className={TH}>
                  수정일
                </th>
              </tr>
            </thead>
            <tbody>
              {SYSTEM_CHARTS.map((system) => {
                const c = bySlug.get(system.slug);
                if (!c) return null;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/charts/${c.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {system.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <ul>
                        {system.usedIn.map((u) => (
                          <li key={u}>{u}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {c.rows.length}행 × {c.series.length}계열
                      {c.rows.length > 0 && (
                        <span className="block text-xs">
                          {c.rows[0].label}~{c.rows[c.rows.length - 1].label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.updatedAt ? formatDate(c.updatedAt) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="tables-heading" className="space-y-3">
        <div>
          <h2 id="tables-heading" className="text-lg font-bold">
            글자 표
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            &lsquo;240.4 (82.3)&rsquo;처럼 글자 그대로 싣는 공식 표입니다. 칸을 고치거나 열·행을
            추가하세요.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/60 text-left">
              <tr>
                <th scope="col" className={TH}>
                  표
                </th>
                <th scope="col" className={TH}>
                  쓰이는 곳
                </th>
                <th scope="col" className={TH}>
                  수정일
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map(({ config, saved }) => (
                <tr key={config.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/charts/tables/${config.slug}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {config.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{config.usedIn}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {saved ? formatDate(saved.updatedAt) : "처음 값"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
